import type { Container } from "pixi.js";
import { Explosion } from "../entities/Explosion";

export class ExplosionSystem {
	private explosions: Explosion[] = [];
	private container: Container;
	private maxExplosions: number = 15;

	constructor(container: Container) {
		this.container = container;
	}

	createExplosion(x: number, y: number): void {
		// Limit active explosions for performance
		if (this.explosions.length >= this.maxExplosions) {
			const oldest = this.explosions.shift();
			if (oldest) {
				this.container.removeChild(oldest.graphics);
				oldest.destroy();
			}
		}

		const explosion = new Explosion(x, y);
		this.explosions.push(explosion);
		this.container.addChild(explosion.graphics);
	}

	update(delta: number): void {
		// Update all explosions and remove expired ones
		this.explosions = this.explosions.filter((explosion) => {
			const expired = explosion.update(delta);
			if (expired) {
				this.container.removeChild(explosion.graphics);
				explosion.destroy();
				return false;
			}
			return true;
		});
	}

	destroy(): void {
		for (const explosion of this.explosions) {
			this.container.removeChild(explosion.graphics);
			explosion.destroy();
		}
		this.explosions = [];
	}
}
