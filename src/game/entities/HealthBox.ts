import { Graphics } from "pixi.js";
import { GlowFilter } from "pixi-filters/glow";

export class HealthBox {
	public graphics: Graphics;
	public position: { x: number; y: number };
	public velocity: { x: number; y: number };
	public size: number;
	public isActive: boolean;
	private color: number;

	constructor(
		x: number,
		y: number,
		velocityX: number,
		velocityY: number,
		size: number,
		color: number,
	) {
		this.position = { x, y };
		this.velocity = { x: velocityX, y: velocityY };
		this.size = size;
		this.color = color;
		this.isActive = true;
		this.graphics = new Graphics();
		this.render();
	}

	update(delta: number, canvasWidth: number, canvasHeight: number): void {
		if (!this.isActive) return;

		this.position.x += this.velocity.x * delta;
		this.position.y += this.velocity.y * delta;

		// Check if box went off screen in any direction
		if (
			this.position.x < -this.size ||
			this.position.x > canvasWidth + this.size ||
			this.position.y > canvasHeight + this.size
		) {
			this.isActive = false;
		}

		this.render();
	}

	private render(): void {
		this.graphics.clear();
		if (!this.isActive) return;

		// Draw box (square) at current position with glow effect
		const rect = this.graphics.rect(
			this.position.x - this.size / 2,
			this.position.y - this.size / 2,
			this.size,
			this.size,
		);

		rect.filters = new GlowFilter({
			distance: this.size * 1.5,
			color: this.color,
			quality: 0.2,
			alpha: 0.8,
		});
		this.graphics.fill({ color: this.color, alpha: 1 });
	}

	reset(x: number, y: number, velocityX: number, velocityY: number): void {
		this.position.x = x;
		this.position.y = y;
		this.velocity.x = velocityX;
		this.velocity.y = velocityY;
		this.isActive = true;
		this.render();
	}

	destroy(): void {
		this.graphics.destroy();
	}
}
