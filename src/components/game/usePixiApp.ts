import { Application } from "pixi.js";
import { type RefObject, useEffect, useState } from "react";
import { GAME_CONFIG } from "../../game/constants";

export function usePixiApp(
	canvasRef: RefObject<HTMLDivElement | null>,
): Application | null {
	const [app, setApp] = useState<Application | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only initialize PixiJS once on mount
	useEffect(() => {
		if (!canvasRef.current) return;

		let pixiApp: Application | null = null;
		let mounted = true;

		const initPixi = async () => {
			pixiApp = new Application();

			await pixiApp.init({
				width: GAME_CONFIG.CANVAS_WIDTH,
				height: GAME_CONFIG.CANVAS_HEIGHT,
				background: GAME_CONFIG.COLOR_BACKGROUND,
				antialias: true,
			});

			if (mounted && canvasRef.current && pixiApp.canvas) {
				canvasRef.current.appendChild(pixiApp.canvas);
				setApp(pixiApp);
				console.log("PixiJS app initialized successfully");
			} else if (!mounted && pixiApp) {
				// Component unmounted during init, clean up
				pixiApp.destroy(true, { children: true });
			}
		};

		initPixi().catch((error: unknown) => {
			console.error("Failed to initialize PixiJS:", error);
		});

		return () => {
			mounted = false;
			if (pixiApp) {
				try {
					pixiApp.destroy(true, { children: true });
				} catch (error) {
					console.error("Error destroying PixiJS app:", error);
				}
			}
		};
	}, []);

	return app;
}
