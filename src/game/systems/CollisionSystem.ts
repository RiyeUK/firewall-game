import type { CentralCircle } from "../entities/CentralCircle";
import type { DefenseWall } from "../entities/DefenseWall";
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
}
