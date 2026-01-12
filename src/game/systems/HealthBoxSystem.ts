import type { Container } from "pixi.js";
import { getGameConfig } from "../constants";
import { HealthBox } from "../entities/HealthBox";

export class HealthBoxSystem {
	private healthBoxes: HealthBox[] = [];
	private container: Container;
	private lastSpawnTime: number = 0;
	private screenWidth: number;
	private screenHeight: number;
	private readonly spawnInterval: number = 15000; // Spawn every 15 seconds

	constructor(screenWidth: number, screenHeight: number, container: Container) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.container = container;
	}

	update(delta: number, currentTime: number): void {
		// Spawn new health box
		if (
			currentTime - this.lastSpawnTime >= this.spawnInterval &&
			this.healthBoxes.length < 3
		) {
			this.spawnHealthBox();
			this.lastSpawnTime = currentTime;
		}

		// Update all active health boxes
		for (const healthBox of this.healthBoxes) {
			if (healthBox.isActive) {
				healthBox.update(delta, this.screenWidth, this.screenHeight);
			}
		}

		// Remove inactive health boxes
		this.healthBoxes = this.healthBoxes.filter((healthBox) => {
			if (!healthBox.isActive) {
				this.container.removeChild(healthBox.graphics);
				healthBox.destroy();
				return false;
			}
			return true;
		});
	}

	private spawnHealthBox(): void {
		// Spawn at random X position at top of screen
		const spawnX = Math.random() * this.screenWidth;
		const spawnY = -50;

		// Pick a random point on the target circle's circumference
		const randomAngle = Math.random() * Math.PI * 2;
		const targetX =
			getGameConfig().CIRCLE_CENTER_X +
			getGameConfig().CIRCLE_RADIUS * Math.cos(randomAngle);
		const targetY =
			getGameConfig().CIRCLE_CENTER_Y +
			getGameConfig().CIRCLE_RADIUS * Math.sin(randomAngle);

		// Calculate direction vector from spawn to target
		const dx = targetX - spawnX;
		const dy = targetY - spawnY;
		const distance = Math.sqrt(dx * dx + dy * dy);

		// Normalize and scale by particle speed (use same speed as particles)
		const velocityX = (dx / distance) * getGameConfig().PARTICLE_SPEED;
		const velocityY = (dy / distance) * getGameConfig().PARTICLE_SPEED;

		const minDimension = Math.min(this.screenWidth, this.screenHeight);
		const boxSize = minDimension * 0.015; // 1.5% of min dimension

		const healthBox = new HealthBox(
			spawnX,
			spawnY,
			velocityX,
			velocityY,
			boxSize,
			0x00ff00, // Green colour for health
		);
		this.healthBoxes.push(healthBox);
		this.container.addChild(healthBox.graphics);
	}

	getActiveHealthBoxes(): HealthBox[] {
		return this.healthBoxes.filter((box) => box.isActive);
	}

	removeHealthBox(healthBox: HealthBox): void {
		healthBox.isActive = false;
	}

	destroy(): void {
		for (const healthBox of this.healthBoxes) {
			this.container.removeChild(healthBox.graphics);
			healthBox.destroy();
		}
		this.healthBoxes = [];
	}
}
