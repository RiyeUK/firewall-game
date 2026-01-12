import { Graphics } from "pixi.js";

export class Explosion {
	public graphics: Graphics;
	public position: { x: number; y: number };
	private time: number = 0;
	private duration: number = 300;
	private maxRadius: number = 30;

	constructor(x: number, y: number) {
		this.position = { x, y };
		this.graphics = new Graphics();
		this.render();
	}

	update(delta: number): boolean {
		this.time += delta * 16.67;
		this.render();
		return this.time >= this.duration;
	}

	private render(): void {
		this.graphics.clear();

		const progress = this.time / this.duration;
		const radius = progress * this.maxRadius;
		const alpha = 1 - progress;

		if (alpha <= 0) return;

		// Simple expanding ring without chromatic aberration
		this.graphics.circle(this.position.x, this.position.y, radius);
		this.graphics.stroke({ width: 2, color: 0xffff00, alpha: alpha * 0.8 });

		// Inner fill
		this.graphics.circle(this.position.x, this.position.y, radius * 0.6);
		this.graphics.fill({ color: 0xffffff, alpha: alpha * 0.4 });
	}

	destroy(): void {
		this.graphics.destroy();
	}
}
