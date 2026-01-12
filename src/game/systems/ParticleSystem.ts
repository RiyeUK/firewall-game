import type { Container } from "pixi.js";
import { getGameConfig } from "../constants";
import { Particle } from "../entities/Particle";

export class ParticleSystem {
	private particles: Particle[] = [];
	private container: Container;
	private lastSpawnTime: number = 0;
	private screenWidth: number;
	private screenHeight: number;
	private startTime: number;

	constructor(screenWidth: number, screenHeight: number, container: Container) {
		this.screenWidth = screenWidth;
		this.screenHeight = screenHeight;
		this.container = container;
		this.startTime = Date.now();
	}

	update(delta: number, currentTime: number): void {
		const gameTime = currentTime - this.startTime;
		const secondsElapsed = gameTime / 1000;

		// Progressive difficulty: decrease spawn interval over time
		const currentInterval = Math.max(
			getGameConfig().MIN_SPAWN_INTERVAL,
			getGameConfig().PARTICLE_SPAWN_INTERVAL -
				secondsElapsed * getGameConfig().PARTICLE_SPAWN_DECREASE,
		);

		// Spawn new particles
		if (
			currentTime - this.lastSpawnTime >= currentInterval &&
			this.particles.length < getGameConfig().MAX_PARTICLES
		) {
			this.spawnParticle();
			this.lastSpawnTime = currentTime;
		}

		// Update all active particles
		for (const particle of this.particles) {
			if (particle.isActive) {
				particle.update(delta, this.screenWidth, this.screenHeight);
			}
		}

		// Remove inactive particles
		this.particles = this.particles.filter((particle) => {
			if (!particle.isActive) {
				this.container.removeChild(particle.graphics);
				particle.destroy();
				return false;
			}
			return true;
		});
	}

	private spawnParticle(): void {
		// Spawn at random X position at top of screen
		const spawnX = Math.random() * this.screenWidth;
		const spawnY = -getGameConfig().PARTICLE_RADIUS;

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

		// Normalize and scale by particle speed
		const velocityX = (dx / distance) * getGameConfig().PARTICLE_SPEED;
		const velocityY = (dy / distance) * getGameConfig().PARTICLE_SPEED;

		const particle = new Particle(
			spawnX,
			spawnY,
			velocityX,
			velocityY,
			getGameConfig().PARTICLE_RADIUS,
			getGameConfig().COLOR_PARTICLE,
		);
		this.particles.push(particle);
		this.container.addChild(particle.graphics);
	}

	getActiveParticles(): Particle[] {
		return this.particles.filter((p) => p.isActive);
	}

	removeParticle(particle: Particle): void {
		particle.isActive = false;
	}

	clearParticlesNearCircle(
		centerX: number,
		centerY: number,
		radius: number,
	): void {
		for (const particle of this.particles) {
			if (!particle.isActive) continue;

			const dx = particle.position.x - centerX;
			const dy = particle.position.y - centerY;
			const distance = Math.sqrt(dx * dx + dy * dy);

			if (distance < radius) {
				particle.isActive = false;
			}
		}
	}

	destroy(): void {
		for (const particle of this.particles) {
			this.container.removeChild(particle.graphics);
			particle.destroy();
		}
		this.particles = [];
	}
}
