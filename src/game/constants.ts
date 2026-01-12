export const GAME_CONFIG = {
	CANVAS_WIDTH: 800,
	CANVAS_HEIGHT: 600,

	PLANET_HP: 3,

	// Central circle
	CIRCLE_CENTER_X: 400,
	CIRCLE_CENTER_Y: 700,
	CIRCLE_RADIUS: 200,

	// Defense wall
	WALL_DISTANCE: 350,
	WALL_ARC_ANGLE: Math.PI / 8,
	WALL_THICKNESS: 5,

	// Particles
	PARTICLE_RADIUS: 2,
	PARTICLE_SPEED: 2,
	PARTICLE_SPAWN_INTERVAL: 1000, // Initial spawn interval in ms
	PARTICLE_SPAWN_DECREASE: 20, // Decrease interval by this much per second
	MIN_SPAWN_INTERVAL: 200, // Minimum spawn interval
	MAX_PARTICLES: 200,

	// Colours
	COLOR_BACKGROUND: 0x000000,
	COLOR_CIRCLE: 0xffffff,
	COLOR_WALL: 0xffffff,
	COLOR_PARTICLE: 0xffffff,
} as const;
