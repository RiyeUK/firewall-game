import { Application } from "pixi.js";
import { CRTFilter } from "pixi-filters/crt";
import { GlitchFilter } from "pixi-filters/glitch";
import { GlowFilter } from "pixi-filters/glow";
import { type RefObject, useEffect, useState } from "react";
import { getGameConfig } from "../../game/constants";

export interface PixiAppWithFilters {
	app: Application;
	glitchFilter: GlitchFilter;
}

export function usePixiApp(
	canvasRef: RefObject<HTMLDivElement | null>,
): PixiAppWithFilters | null {
	const [appData, setAppData] = useState<PixiAppWithFilters | null>(null);

	// biome-ignore lint/correctness/useExhaustiveDependencies: Only initialize PixiJS once on mount
	useEffect(() => {
		if (!canvasRef.current) return;

		let pixiApp: Application | null = null;
		let mounted = true;

		const initPixi = async () => {
			const config = getGameConfig();
			pixiApp = new Application();

			await pixiApp.init({
				width: config.CANVAS_WIDTH,
				height: config.CANVAS_HEIGHT,
				background: config.COLOR_BACKGROUND,
				antialias: true,
			});

			if (mounted && canvasRef.current && pixiApp.canvas) {
				canvasRef.current.appendChild(pixiApp.canvas);

				// Add CRT and glow filters for retro look
				const crtFilter = new CRTFilter({
					curvature: 1,
					lineWidth: 1,
					lineContrast: 0.15,
					noise: 0.08,
					noiseSize: 1,
					vignetting: 0.2,
					vignettingAlpha: 0.7,
					vignettingBlur: 0.2,
				});

				const glowFilter = new GlowFilter({
					distance: 10,
					outerStrength: 1.5,
					innerStrength: 0.5,
					color: 0x00ffff,
					quality: 0.3,
				});

				const glitchFilter = new GlitchFilter({
					slices: 10,
					offset: 20,
					direction: 0,
					fillMode: 0,
					seed: 0,
					average: false,
					minSize: 8,
					sampleSize: 512,
					red: [0, 0],
					green: [0, 0],
					blue: [0, 0],
				});

				pixiApp.stage.filters = [crtFilter, glowFilter, glitchFilter];

				setAppData({ app: pixiApp, glitchFilter });
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

	// Handle window resize
	useEffect(() => {
		if (!appData) return;

		const handleResize = () => {
			const config = getGameConfig();
			appData.app.renderer.resize(config.CANVAS_WIDTH, config.CANVAS_HEIGHT);
		};

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, [appData]);

	return appData;
}
