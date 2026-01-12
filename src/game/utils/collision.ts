import { distance, normalizeAngle } from "./geometry";

export function circleCircleCollision(
	x1: number,
	y1: number,
	r1: number,
	x2: number,
	y2: number,
	r2: number,
): boolean {
	const dist = distance(x1, y1, x2, y2);
	return dist < r1 + r2;
}

export interface ArcData {
	centerX: number;
	centerY: number;
	radius: number;
	currentAngle: number;
	arcAngle: number;
	thickness: number;
}

export function circleArcCollision(
	circleX: number,
	circleY: number,
	circleRadius: number,
	arc: ArcData,
): boolean {
	const dx = circleX - arc.centerX;
	const dy = circleY - arc.centerY;

	// Check distance from center
	const dist = Math.sqrt(dx * dx + dy * dy);
	const distanceMatch =
		Math.abs(dist - arc.radius) < circleRadius + arc.thickness / 2;

	if (!distanceMatch) return false;

	// Check angle within arc span
	const particleAngle = Math.atan2(dy, dx);
	const angleDiff = normalizeAngle(particleAngle - arc.currentAngle);

	return Math.abs(angleDiff) <= arc.arcAngle / 2;
}
