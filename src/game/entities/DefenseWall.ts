import { Graphics } from "pixi.js";

export class DefenseWall {
	public graphics: Graphics;
	public centerX: number;
	public centerY: number;
	public radius: number;
	public arcAngle: number;
	public currentAngle: number;
	public thickness: number;
	private color: number;

	constructor(
		centerX: number,
		centerY: number,
		radius: number,
		arcAngle: number,
		thickness: number,
		color: number,
	) {
		this.centerX = centerX;
		this.centerY = centerY;
		this.radius = radius;
		this.arcAngle = arcAngle;
		this.thickness = thickness;
		this.color = color;
		this.currentAngle = 0;
		this.graphics = new Graphics();
		this.render();
	}

	updatePosition(mouseX: number, mouseY: number): void {
		const dx = mouseX - this.centerX;
		const dy = mouseY - this.centerY;
		this.currentAngle = Math.atan2(dy, dx);
		this.render();
	}

	private render(): void {
		this.graphics.clear();

		this.graphics.arc(
			this.centerX,
			this.centerY,
			this.radius,
			this.currentAngle - this.arcAngle / 2,
			this.currentAngle + this.arcAngle / 2,
		);
		this.graphics.stroke({
			width: 2,
			color: this.color,
		});
	}

	destroy(): void {
		this.graphics.destroy();
	}
}
