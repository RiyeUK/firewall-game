import { Graphics } from "pixi.js";

export class CentralCircle {
	public graphics: Graphics;
	public position: { x: number; y: number };
	public radius: number;

	constructor(x: number, y: number, radius: number, color: number) {
		this.position = { x, y };
		this.radius = radius;
		this.graphics = new Graphics();
		this.render(color);
	}

	private render(color: number): void {
		this.graphics.clear();
		this.graphics.circle(this.position.x, this.position.y, this.radius);
		this.graphics.stroke({ width: 2, color });
	}

	destroy(): void {
		this.graphics.destroy();
	}
}
