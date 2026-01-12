export class InputSystem {
	private mousePosition: { x: number; y: number } = { x: 0, y: 0 };
	private canvas: HTMLCanvasElement;
	private mouseMoveHandler: (e: MouseEvent) => void;
	private touchStartHandler: (e: TouchEvent) => void;
	private touchMoveHandler: (e: TouchEvent) => void;
	private touchEndHandler: (e: TouchEvent) => void;

	constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.mouseMoveHandler = this.handleMouseMove.bind(this);
		this.touchStartHandler = this.handleTouchStart.bind(this);
		this.touchMoveHandler = this.handleTouchMove.bind(this);
		this.touchEndHandler = this.handleTouchEnd.bind(this);
	}

	initialize(): void {
		this.canvas.addEventListener("mousemove", this.mouseMoveHandler);
		this.canvas.addEventListener("touchstart", this.touchStartHandler, {
			passive: false,
		});
		this.canvas.addEventListener("touchmove", this.touchMoveHandler, {
			passive: false,
		});
		this.canvas.addEventListener("touchend", this.touchEndHandler);
	}

	private handleMouseMove(e: MouseEvent): void {
		const rect = this.canvas.getBoundingClientRect();
		this.mousePosition.x = e.clientX - rect.left;
		this.mousePosition.y = e.clientY - rect.top;
	}

	private handleTouchStart(e: TouchEvent): void {
		e.preventDefault();
		if (e.touches.length > 0) {
			const touch = e.touches[0];
			const rect = this.canvas.getBoundingClientRect();
			this.mousePosition.x = touch.clientX - rect.left;
			this.mousePosition.y = touch.clientY - rect.top;
		}
	}

	private handleTouchMove(e: TouchEvent): void {
		e.preventDefault();
		if (e.touches.length > 0) {
			const touch = e.touches[0];
			const rect = this.canvas.getBoundingClientRect();
			this.mousePosition.x = touch.clientX - rect.left;
			this.mousePosition.y = touch.clientY - rect.top;
		}
	}

	private handleTouchEnd(e: TouchEvent): void {
		e.preventDefault();
	}

	getMousePosition(): { x: number; y: number } {
		return this.mousePosition;
	}

	destroy(): void {
		this.canvas.removeEventListener("mousemove", this.mouseMoveHandler);
		this.canvas.removeEventListener("touchstart", this.touchStartHandler);
		this.canvas.removeEventListener("touchmove", this.touchMoveHandler);
		this.canvas.removeEventListener("touchend", this.touchEndHandler);
	}
}
