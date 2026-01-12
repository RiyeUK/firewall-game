import { getGameConfig } from "./constants";

export class GameState {
	private _score: number = 0;
	private _isGameOver: boolean = false;
	private _hp: number = getGameConfig().PLANET_HP;
	private _gameTime: number = 0;
	private listeners: Set<() => void> = new Set();

	subscribe(listener: () => void): () => void {
		this.listeners.add(listener);
		return () => {
			this.listeners.delete(listener);
		};
	}

	private notify(): void {
		for (const listener of this.listeners) {
			listener();
		}
	}

	get score(): number {
		return this._score;
	}

	get hp(): number {
		return this._hp;
	}

	get isGameOver(): boolean {
		return this._isGameOver;
	}

	get gameTime(): number {
		return this._gameTime;
	}

	incrementScore(amount: number): void {
		this._score += amount;
		this.notify();
	}

	updateGameTime(time: number): void {
		this._gameTime = time;
	}

	hit(): void {
		this._hp -= 1;
		if (this._hp <= 0) this.gameOver();
	}

	gameOver(): void {
		this._isGameOver = true;
		this.notify();
	}

	reset(): void {
		this._score = 0;
		this._isGameOver = false;
		this._hp = getGameConfig().PLANET_HP;
		this._gameTime = 0;
		this.notify();
	}
}
