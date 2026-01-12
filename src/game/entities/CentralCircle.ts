import { Graphics } from "pixi.js";

export class CentralCircle {
	public graphics: Graphics;
	public position: { x: number; y: number };
	public radius: number;
	private color: number;
	private currentRings: number;

	constructor(
		x: number,
		y: number,
		radius: number,
		color: number,
		rings: number,
	) {
		this.position = { x, y };
		this.radius = radius;
		this.color = color;
		this.currentRings = rings;
		this.graphics = new Graphics();
		this.render();
	}

	updateRings(rings: number): void {
		if (this.currentRings !== rings) {
			this.currentRings = rings;
			this.render();
		}
	}

	private render(): void {
		this.graphics.clear();

		for (let i = 1; i < this.currentRings; i++) {
			// Outer glow ring
			this.graphics.circle(
				this.position.x,
				this.position.y,
				this.radius + i * 10,
			);
			this.graphics.stroke({ width: 3, color: this.color, alpha: 0.3 });
		}

		// Main circle
		this.graphics.circle(this.position.x, this.position.y, this.radius);
		this.graphics.stroke({ width: 4, color: this.color, alpha: 0.8 });
	}

	destroy(): void {
		this.graphics.destroy();
	}
}
