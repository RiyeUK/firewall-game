export class InputSystem {
	private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
	private canvas: HTMLCanvasElement;
	private mouseMoveHandler: (e: MouseEvent) => void;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.mouseMoveHandler = this.handleMouseMove.bind(this);
	}

	initialize(): void {
		this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
	}

	private handleMouseMove(e: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		this.mousePosition.x = e.clientX - rect.left;
		this.mousePosition.y = e.clientY - rect.top;
	}

	getMousePosition(): { x: number; y: number } {
		return this.mousePosition;
	}

	destroy(): void {
		this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
	}
}
