export function getGameConfig() {
	const width = window.innerWidth;
	const height = window.innerHeight;
	const minDimension = Math.min(width, height);

	return {
		CANVAS_WIDTH: width,
		CANVAS_HEIGHT: height,

		START_HP: 4,
		MAX_HP: 6,

		// Central circle
		CIRCLE_CENTER_X: width / 2,
		CIRCLE_CENTER_Y: height + height * 0.1, // 10% of screen height offset
		CIRCLE_RADIUS: width * 0.4,

		// Defense wall
		WALL_DISTANCE: width * 0.6,
		WALL_ARC_ANGLE: Math.PI / 5,
		WALL_THICKNESS: minDimension * 0.008, // ~0.8% of min dimension

		// Particles
		PARTICLE_RADIUS: minDimension * 0.002, // ~0.05% of min dimension
		PARTICLE_SPEED: height * 0.002, // ~0.2% of min dimension per frame
		PARTICLE_SPAWN_INTERVAL: 1000,
		PARTICLE_SPAWN_DECREASE: 20,
		MIN_SPAWN_INTERVAL: 200,
		MAX_PARTICLES: 200,

		// Colours
		COLOR_BACKGROUND: 0x000000,
		COLOR_CIRCLE: 0x3acee2,
		COLOR_WALL: 0x3acee2,
		COLOR_PARTICLE: 0xff0000,
	};
}
