import { angle, distance, normalizeAngle } from "src/lib/utils";
import Entity from "../Entity";
import PositionComponent from "../components/PositionComponent";
import CircleComponent from "../components/CircleComponent";

type Radius = number;
type Angle = number;

export interface PolarPosition {
  distance: Radius; 
  angleFrom: Angle;
  angleTo: Angle;
  entity: Entity;
}

export default class PolarMap {
  polarEntities: PolarPosition[] = [];

  constructor(center: Entity, entities: Entity[]) {
    this.calculatePolarEntities(center, entities);
  }

  public select(distanceTo: number, angleFrom: number, angleTo: number) {

    angleFrom = normalizeAngle(angleFrom);
    angleTo = normalizeAngle(angleTo);

    return this.polarEntities
      .filter((polarEntity) => {
        if (distanceTo <= polarEntity.distance) {
          return false
        }

        const a1 = 0;
        const a2 = normalizeAngle(polarEntity.angleTo - polarEntity.angleFrom);
        const b1 = normalizeAngle(angleFrom - polarEntity.angleFrom);
        const b2 = normalizeAngle(angleTo - polarEntity.angleFrom);

        return (
          a1 <= b1 && b1 <= a2 &&
          a1 <= b2 && b2 <= a2
        )
      })
      .sort((pe1, pe2) => pe2.distance - pe1.distance)
  }

  protected calculatePolarEntities(center: Entity, entities: Entity[]) {
    const centerPosition = center.getComponent(PositionComponent);

    this.polarEntities = entities.map(entity => {
      const pointCircle = entity.getComponent(CircleComponent);
      const pointPosition = entity.getComponent(PositionComponent);
      const a = angle(
        centerPosition.x,
        centerPosition.y,
        pointPosition.x,
        pointPosition.y,
      );

      const d = distance(
        centerPosition.x,
        centerPosition.y,
        pointPosition.x,
        pointPosition.y,
      );

      const ta = Math.asin(pointCircle.radius / (d)) * (180 / Math.PI);
  
      return {
        distance: d,
        angleFrom: normalizeAngle(a - ta),
        angleTo: normalizeAngle(a + ta),
        entity
      }
    }).filter(polarEntity => !isNaN(polarEntity.angleFrom));
  }
}
