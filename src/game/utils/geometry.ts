export function distance(
	x1: number,
	y1: number,
	x2: number,
	y2: number,
): number {
	const dx = x2 - x1;
	const dy = y2 - y1;
	return Math.sqrt(dx * dx + dy * dy);
}

export function normalizeAngle(angle: number): number {
	let normalized = angle;
	while (normalized > Math.PI) normalized -= 2 * Math.PI;
	while (normalized < -Math.PI) normalized += 2 * Math.PI;
	return normalized;
}
