import { useEffect, useReducer, useRef } from "react";
import { getGameConfig } from "../../game/constants";
import { CentralCircle } from "../../game/entities/CentralCircle";
import { DefenseWall } from "../../game/entities/DefenseWall";
import { GameState } from "../../game/GameState";
import { CollisionSystem } from "../../game/systems/CollisionSystem";
import { ExplosionSystem } from "../../game/systems/ExplosionSystem";
import { HealthBoxSystem } from "../../game/systems/HealthBoxSystem";
import { InputSystem } from "../../game/systems/InputSystem";
import { ParticleSystem } from "../../game/systems/ParticleSystem";
import { useGameLoop } from "./useGameLoop";
import { usePixiApp } from "./usePixiApp";

function useGameState(gameState: GameState): GameState {
	const [, forceUpdate] = useReducer((x) => x + 1, 0);

	useEffect(() => {
		return gameState.subscribe(forceUpdate);
	}, [gameState]);

	return gameState;
}

export function GameCanvas() {
	const canvasRef = useRef<HTMLDivElement>(null);
	const appData = usePixiApp(canvasRef);
	const gameStateRef = useRef(new GameState());
	const reactiveGameState = useGameState(gameStateRef.current);

	console.log("GameCanvas rendering, appData:", appData);

	const entitiesRef = useRef<{
		circle: CentralCircle | null;
		wall: DefenseWall | null;
		particleSystem: ParticleSystem | null;
		healthBoxSystem: HealthBoxSystem | null;
		explosionSystem: ExplosionSystem | null;
		collisionSystem: CollisionSystem | null;
		inputSystem: InputSystem | null;
	}>({
		circle: null,
		wall: null,
		particleSystem: null,
		healthBoxSystem: null,
		explosionSystem: null,
		collisionSystem: null,
		inputSystem: null,
	});

	// Initialize game entities
	useEffect(() => {
		if (!appData) return;

		const config = getGameConfig();

		const circle = new CentralCircle(
			config.CIRCLE_CENTER_X,
			config.CIRCLE_CENTER_Y,
			config.CIRCLE_RADIUS,
			config.COLOR_CIRCLE,
			config.START_HP,
		);

		const wall = new DefenseWall(
			config.CIRCLE_CENTER_X,
			config.CIRCLE_CENTER_Y,
			config.WALL_DISTANCE,
			config.WALL_ARC_ANGLE,
			config.WALL_THICKNESS,
			config.COLOR_WALL,
		);

		const particleSystem = new ParticleSystem(
			config.CANVAS_WIDTH,
			config.CANVAS_HEIGHT,
			appData.app.stage,
		);

		const healthBoxSystem = new HealthBoxSystem(
			config.CANVAS_WIDTH,
			config.CANVAS_HEIGHT,
			appData.app.stage,
		);

		const explosionSystem = new ExplosionSystem(appData.app.stage);

		const collisionSystem = new CollisionSystem();
		const inputSystem = new InputSystem(
			appData.app.canvas as HTMLCanvasElement,
		);
		inputSystem.initialize();

		// Add entities to stage
		appData.app.stage.addChild(circle.graphics);
		appData.app.stage.addChild(wall.graphics);

		entitiesRef.current = {
			circle,
			wall,
			particleSystem,
			healthBoxSystem,
			explosionSystem,
			collisionSystem,
			inputSystem,
		};

		return () => {
			circle.destroy();
			wall.destroy();
			particleSystem.destroy();
			healthBoxSystem.destroy();
			explosionSystem.destroy();
			inputSystem.destroy();
		};
	}, [appData]);

	// Game loop
	useGameLoop(appData?.app ?? null, (delta) => {
		const entities = entitiesRef.current;
		const gameState = gameStateRef.current;

		if (
			!entities.circle ||
			!entities.wall ||
			!entities.particleSystem ||
			!entities.healthBoxSystem ||
			!entities.explosionSystem ||
			!entities.collisionSystem ||
			!entities.inputSystem
		) {
			return;
		}

		if (gameState.isGameOver) {
			return;
		}

		// Random glitch effect
		if (appData && Math.random() < 0.001) {
			const config = getGameConfig();
			const minDimension = Math.min(config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
			appData.glitchFilter.seed = Math.random();
			appData.glitchFilter.slices = 5 + Math.floor(Math.random() * 10);
			appData.glitchFilter.offset =
				minDimension * 0.01 + Math.random() * minDimension * 0.02; // 1-3% of min dimension
			appData.glitchFilter.red = [
				Math.random() * 5 - 2.5,
				Math.random() * 5 - 2.5,
			];
			appData.glitchFilter.green = [
				Math.random() * 5 - 2.5,
				Math.random() * 5 - 2.5,
			];
			appData.glitchFilter.blue = [
				Math.random() * 5 - 2.5,
				Math.random() * 5 - 2.5,
			];
			setTimeout(
				() => {
					if (appData) {
						appData.glitchFilter.slices = 0;
						appData.glitchFilter.offset = 0;
					}
				},
				50 + Math.random() * 100,
			);
		}

		// Update input
		if (gameState.hasStarted) {
			const mousePos = entities.inputSystem.getMousePosition();
			entities.wall.updatePosition(mousePos.x, mousePos.y);
		} else {
			// Demo mode: rotate wall automatically
			const config = getGameConfig();
			const time = Date.now() * 0.001;
			const centerX = config.CIRCLE_CENTER_X;
			const centerY = config.CIRCLE_CENTER_Y;
			const radius = config.WALL_DISTANCE;
			const demoX = centerX + Math.cos(time) * radius;
			const demoY = centerY + Math.sin(time) * radius;
			entities.wall.updatePosition(demoX, demoY);
		}

		// Update particles
		entities.particleSystem.update(delta, Date.now());

		// Update health boxes
		entities.healthBoxSystem.update(delta, Date.now());

		// Update explosions
		entities.explosionSystem.update(delta);

		// Collision detection
		const particles = entities.particleSystem.getActiveParticles();
		for (const particle of particles) {
			// Check wall collision first (destroy particle, increment score)
			if (
				entities.collisionSystem.checkParticleWallCollision(
					particle,
					entities.wall,
				)
			) {
				entities.explosionSystem.createExplosion(
					particle.position.x,
					particle.position.y,
				);
				particle.isActive = false;
				if (gameState.hasStarted) {
					gameState.incrementScore(1);
				}

				continue;
			}

			// Check circle collision
			if (
				entities.collisionSystem.checkParticleCircleCollision(
					particle,
					entities.circle,
				)
			) {
				particle.isActive = false;

				if (gameState.hasStarted) {
					gameState.hit();

					// Update planet rings to reflect HP
					entities.circle.updateRings(gameState.hp);
				}

				// Create explosion at impact point
				entities.explosionSystem.createExplosion(
					particle.position.x,
					particle.position.y,
				);

				// Screen shake
				if (appData && gameState.hasStarted) {
					const config = getGameConfig();
					const minDimension = Math.min(
						config.CANVAS_WIDTH,
						config.CANVAS_HEIGHT,
					);
					const shakeAmount = minDimension * 0.008; // 0.8% of min dimension
					appData.app.stage.position.set(
						Math.random() * shakeAmount - shakeAmount / 2,
						Math.random() * shakeAmount - shakeAmount / 2,
					);
					setTimeout(() => appData.app.stage.position.set(0, 0), 100);
				}

				return;
			}
		}

		// Check health box collision with wall (collect health)
		const healthBoxes = entities.healthBoxSystem.getActiveHealthBoxes();
		for (const healthBox of healthBoxes) {
			if (
				entities.collisionSystem.checkHealthBoxWallCollision(
					healthBox,
					entities.wall,
				)
			) {
				healthBox.isActive = false;
				if (gameState.hasStarted) {
					gameState.heal();

					// Update planet rings to reflect HP
					entities.circle.updateRings(gameState.hp);
				}

				// Create explosion at collection point
				entities.explosionSystem.createExplosion(
					healthBox.position.x,
					healthBox.position.y,
				);
			}
		}
	});

	const handleStart = (): void => {
		gameStateRef.current.start();

		// Clear particles that are too close to the circle for a fair start
		if (entitiesRef.current.particleSystem) {
			const config = getGameConfig();
			const clearanceRadius = config.WALL_DISTANCE + config.CIRCLE_RADIUS;
			entitiesRef.current.particleSystem.clearParticlesNearCircle(
				config.CIRCLE_CENTER_X,
				config.CIRCLE_CENTER_Y,
				clearanceRadius,
			);
		}
	};

	const handleRestart = (): void => {
		gameStateRef.current.reset();

		// Reset planet rings to full HP
		if (entitiesRef.current.circle) {
			const config = getGameConfig();
			entitiesRef.current.circle.updateRings(config.START_HP);
		}

		// Reset particle system
		if (entitiesRef.current.particleSystem) {
			entitiesRef.current.particleSystem.destroy();
			if (appData) {
				const config = getGameConfig();
				entitiesRef.current.particleSystem = new ParticleSystem(
					config.CANVAS_WIDTH,
					config.CANVAS_HEIGHT,
					appData.app.stage,
				);
			}
		}

		// Reset health box system
		if (entitiesRef.current.healthBoxSystem) {
			entitiesRef.current.healthBoxSystem.destroy();
			if (appData) {
				const config = getGameConfig();
				entitiesRef.current.healthBoxSystem = new HealthBoxSystem(
					config.CANVAS_WIDTH,
					config.CANVAS_HEIGHT,
					appData.app.stage,
				);
			}
		}
	};

	return (
		<div className="relative w-screen h-screen overflow-hidden bg-black">
			{/* Canvas container */}
			<div ref={canvasRef} className="absolute inset-0 z-0" />

			{/* Start screen */}
			{!reactiveGameState.hasStarted && !reactiveGameState.isGameOver && (
				<div className="absolute h-full inset-0 flex gap-6 flex-col items-center justify-center bg-black/70 scanline z-20">
					<div className="hacker-text" style={{ fontSize: "5rem" }}>
						FIREWALL DEFENDER
					</div>
					<div
						className="hacker-text text-center max-w-2xl"
						style={{ fontSize: "1.2rem" }}
					>
						PROTECT THE CORE FROM INCOMING THREATS
						<br />
						MOVE YOUR FIREWALL TO INTERCEPT ATTACKS
					</div>
					<button
						type="button"
						onClick={handleStart}
						className="mt-8 px-12 py-6 hacker-border bg-transparent hacker-text text-3xl hover:bg-cyan-500/20 transition-colors cursor-pointer animate-pulse"
					>
						START DEFENSE
					</button>
				</div>
			)}

			{/* Score display */}

			{reactiveGameState.hasStarted && !reactiveGameState.isGameOver && (
				<div
					className="absolute top-8 left-8 hacker-text z-10"
					style={{ fontSize: "3rem" }}
				>
					SCORE: {String(reactiveGameState.score).padStart(6, "0")}
				</div>
			)}

			{/* Game over overlay */}
			{reactiveGameState.isGameOver && (
				<div className="absolute h-full inset-0 flex gap-4 flex-col items-center justify-center bg-black/90 scanline z-20">
					<div className="hacker-text" style={{ fontSize: "4rem" }}>
						SYSTEM BREACH
					</div>
					<div className="hacker-text" style={{ fontSize: "1rem" }}>
						Protecting your computer can be hard on your own. Add more sheilds
						with a VPN.
					</div>
					<div className="hacker-text" style={{ fontSize: "3rem" }}>
						FINAL SCORE: {String(reactiveGameState.score).padStart(6, "0")}
					</div>
					<div className="flex flex-col gap-4 items-center mt-6">
						<input
							type="email"
							placeholder="EMAIL_ADDRESS"
							className="hacker-text hacker-border bg-black/50 px-6 py-3 text-xl focus:outline-none focus:bg-cyan-500/10 transition-colors placeholder:text-cyan-500/50"
						/>
						<button
							type="button"
							className="px-8 py-3 hacker-border bg-transparent hacker-text text-xl hover:bg-cyan-500/20 transition-colors cursor-pointer"
						>
							SEND OFFERS
						</button>
					</div>
					<button
						type="button"
						onClick={handleRestart}
						className="mt-4 px-8 py-4 hacker-border bg-transparent hacker-text text-2xl hover:bg-cyan-500/20 transition-colors cursor-pointer"
					>
						RESTART FIREWALL
					</button>
				</div>
			)}
		</div>
	);
}
