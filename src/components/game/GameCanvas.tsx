import { useEffect, useReducer, useRef } from "react";
import { GAME_CONFIG } from "../../game/constants";
import { CentralCircle } from "../../game/entities/CentralCircle";
import { DefenseWall } from "../../game/entities/DefenseWall";
import { GameState } from "../../game/GameState";
import { CollisionSystem } from "../../game/systems/CollisionSystem";
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
	const app = usePixiApp(canvasRef);
	const gameStateRef = useRef(new GameState());
	const reactiveGameState = useGameState(gameStateRef.current);

	console.log("GameCanvas rendering, app:", app);

	const entitiesRef = useRef<{
		circle: CentralCircle | null;
		wall: DefenseWall | null;
		particleSystem: ParticleSystem | null;
		collisionSystem: CollisionSystem | null;
		inputSystem: InputSystem | null;
	}>({
		circle: null,
		wall: null,
		particleSystem: null,
		collisionSystem: null,
		inputSystem: null,
	});

	// Initialize game entities
	useEffect(() => {
		if (!app) return;

		const circle = new CentralCircle(
			GAME_CONFIG.CIRCLE_CENTER_X,
			GAME_CONFIG.CIRCLE_CENTER_Y,
			GAME_CONFIG.CIRCLE_RADIUS,
			GAME_CONFIG.COLOR_CIRCLE,
		);

		const wall = new DefenseWall(
			GAME_CONFIG.CIRCLE_CENTER_X,
			GAME_CONFIG.CIRCLE_CENTER_Y,
			GAME_CONFIG.WALL_DISTANCE,
			GAME_CONFIG.WALL_ARC_ANGLE,
			GAME_CONFIG.WALL_THICKNESS,
			GAME_CONFIG.COLOR_WALL,
		);

		const particleSystem = new ParticleSystem(
			GAME_CONFIG.CANVAS_WIDTH,
			GAME_CONFIG.CANVAS_HEIGHT,
			app.stage,
		);

		const collisionSystem = new CollisionSystem();
		const inputSystem = new InputSystem(app.canvas as HTMLCanvasElement);
		inputSystem.initialize();

		// Add entities to stage
		app.stage.addChild(circle.graphics);
		app.stage.addChild(wall.graphics);

		entitiesRef.current = {
			circle,
			wall,
			particleSystem,
			collisionSystem,
			inputSystem,
		};

		return () => {
			circle.destroy();
			wall.destroy();
			particleSystem.destroy();
			inputSystem.destroy();
		};
	}, [app]);

	// Game loop
	useGameLoop(app, (delta) => {
		const entities = entitiesRef.current;
		const gameState = gameStateRef.current;

		if (
			gameState.isGameOver ||
			!entities.circle ||
			!entities.wall ||
			!entities.particleSystem ||
			!entities.collisionSystem ||
			!entities.inputSystem
		) {
			return;
		}

		// Update input
		const mousePos = entities.inputSystem.getMousePosition();
		entities.wall.updatePosition(mousePos.x, mousePos.y);

		// Update particles
		entities.particleSystem.update(delta, Date.now());

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
				particle.isActive = false;
				gameState.incrementScore(1);
				continue;
			}

			// Check circle collision (game over)
			if (
				entities.collisionSystem.checkParticleCircleCollision(
					particle,
					entities.circle,
				)
			) {
				particle.isActive = false;
				gameState.hit();
				return;
			}
		}
	});

	const handleRestart = (): void => {
		gameStateRef.current.reset();

		// Reset particle system
		if (entitiesRef.current.particleSystem) {
			entitiesRef.current.particleSystem.destroy();
			if (app) {
				entitiesRef.current.particleSystem = new ParticleSystem(
					GAME_CONFIG.CANVAS_WIDTH,
					GAME_CONFIG.CANVAS_HEIGHT,
					app.stage,
				);
			}
		}
	};

	return (
		<div className="relative">
			<div ref={canvasRef} />

			{/* Score display */}
			<div className="absolute top-4 left-4 text-white text-2xl">
				Score: {reactiveGameState.score}
			</div>
			<div className="text-white text-2xl mb-8">HP: {reactiveGameState.hp}</div>

			{/* Game over overlay */}
			{reactiveGameState.isGameOver && (
				<div className="absolute inset-0 flex flex-col items-center justify-center bg-black/50">
					<div className="text-white text-5xl mb-4">Game Over!</div>
					<div className="text-white text-2xl mb-8">
						Score: {reactiveGameState.score}
					</div>
					<button
						type="button"
						onClick={handleRestart}
						className="px-6 py-3 bg-white text-black rounded"
					>
						Restart
					</button>
				</div>
			)}
		</div>
	);
}
