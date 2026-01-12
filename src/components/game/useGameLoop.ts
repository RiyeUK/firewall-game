import type { Application } from "pixi.js";
import { useEffect, useRef } from "react";

export function useGameLoop(
	app: Application | null,
	callback: (delta: number) => void,
): void {
	const callbackRef = useRef(callback);

	useEffect(() => {
		callbackRef.current = callback;
	}, [callback]);

	useEffect(() => {
		if (!app) return;

		const ticker = app.ticker;
		const tickerCallback = (ticker: { deltaTime: number }) => {
			callbackRef.current(ticker.deltaTime);
		};
		ticker.add(tickerCallback);

		return () => {
			ticker.remove(tickerCallback);
		};
	}, [app]);
}
