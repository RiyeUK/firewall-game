import { Graphics } from "pixi.js";

export class Particle {
	public graphics: Graphics;
	public position: { x: number; y: number };
	public velocity: { x: number; y: number };
	public radius: number;
	public isActive: boolean;
	private color: number;
	private trail: Array<{ x: number; y: number }> = [];
	private readonly maxTrailLength: number = 10;

	constructor(
		x: number,
		y: number,
		velocityX: number,
		velocityY: number,
		radius: number,
		color: number,
	) {
		this.position = { x, y };
		this.velocity = { x: velocityX, y: velocityY };
		this.radius = radius;
		this.color = color;
		this.isActive = true;
		this.graphics = new Graphics();
		this.trail.push({ x, y });
		this.render();
	}

	update(delta: number, canvasWidth: number, canvasHeight: number): void {
		if (!this.isActive) return;

		this.position.x += this.velocity.x * delta;
		this.position.y += this.velocity.y * delta;

		// Add current position to trail
		this.trail.push({ x: this.position.x, y: this.position.y });

		// Limit trail length
		if (this.trail.length > this.maxTrailLength) {
			this.trail.shift();
		}

		// Check if particle went off screen in any direction
		if (
			this.position.x < -this.radius ||
			this.position.x > canvasWidth + this.radius ||
			this.position.y > canvasHeight + this.radius
		) {
			this.isActive = false;
		}

		this.render();
	}

	private render(): void {
		this.graphics.clear();
		if (!this.isActive) return;

		// Draw trail with fading alpha
		if (this.trail.length > 1) {
			for (let i = 0; i < this.trail.length - 1; i++) {
				const point1 = this.trail[i];
				const point2 = this.trail[i + 1];

				// Calculate alpha based on position in trail (older = more transparent)
				const alpha = (i + 1) / this.trail.length;

				this.graphics
					.moveTo(point1.x, point1.y)
					.lineTo(point2.x, point2.y)
					.stroke({ width: this.radius * 1.5, color: this.color, alpha });
			}
		}

		// Draw particle at current position
		this.graphics.circle(this.position.x, this.position.y, this.radius);
		this.graphics.fill({ color: this.color });
	}

	reset(x: number, y: number, velocityX: number, velocityY: number): void {
		this.position.x = x;
		this.position.y = y;
		this.velocity.x = velocityX;
		this.velocity.y = velocityY;
		this.isActive = true;
		this.trail = [{ x, y }];
		this.render();
	}

	destroy(): void {
		this.graphics.destroy();
	}
}
