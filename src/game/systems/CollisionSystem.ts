import type { CentralCircle } from "../entities/CentralCircle";
import type { DefenseWall } from "../entities/DefenseWall";
import type { HealthBox } from "../entities/HealthBox";
import type { Particle } from "../entities/Particle";
import { circleArcCollision, circleCircleCollision } from "../utils/collision";

export class CollisionSystem {
	checkParticleCircleCollision(
		particle: Particle,
		circle: CentralCircle,
	): boolean {
		return circleCircleCollision(
			particle.position.x,
			particle.position.y,
			particle.radius,
			circle.position.x,
			circle.position.y,
			circle.radius,
		);
	}

	checkParticleWallCollision(particle: Particle, wall: DefenseWall): boolean {
		return circleArcCollision(
			particle.position.x,
			particle.position.y,
			particle.radius,
			{
				centerX: wall.centerX,
				centerY: wall.centerY,
				radius: wall.radius,
				currentAngle: wall.currentAngle,
				arcAngle: wall.arcAngle,
				thickness: wall.thickness,
			},
		);
	}

	checkHealthBoxWallCollision(
		healthBox: HealthBox,
		wall: DefenseWall,
	): boolean {
		// Treat the health box as a circle with radius equal to half its size
		const effectiveRadius = healthBox.size / 2;
		return circleArcCollision(
			healthBox.position.x,
			healthBox.position.y,
			effectiveRadius,
			{
				centerX: wall.centerX,
				centerY: wall.centerY,
				radius: wall.radius,
				currentAngle: wall.currentAngle,
				arcAngle: wall.arcAngle,
				thickness: wall.thickness,
			},
		);
	}
}
