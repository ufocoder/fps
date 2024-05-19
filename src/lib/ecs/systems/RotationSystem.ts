import { normalizeAngle } from "src/lib/utils";
import Entity from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import QuerySystem from "../lib/QuerySystem";
import PositionMap from "../lib/PositionMap";
import CameraComponent from "../components/CameraComponent";

export default class RotationSystem extends System {
  requiredComponents = [PositionComponent, AngleComponent, RotateComponent];
  
  protected positionMap: PositionMap<Entity>;
  protected cols: number;
  protected rows: number;

  constructor(querySystem: QuerySystem, level: Level) {
    super(querySystem);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.positionMap = new PositionMap(cols, rows);
    
    this.cols = cols;
    this.rows = rows;

    this.querySystem.query([PositionComponent, CollisionComponent]).forEach(entity => {
      if (entity.hasComponent(CameraComponent)) {
        return;
      }

      const position = entity.getComponent(PositionComponent);

      this.positionMap.set(
        Math.floor(position.x),
        Math.floor(position.y),
        entity
      );
    })
  }
  
  start(): void {}
  destroy(): void {}

  update(dt: number, entities: Entity[]) {
    entities.forEach(entity => {
      this.rotate(dt, entity);
    });
  }

  protected rotate(dt: number, entity: Entity) {
    const angleComponent = entity.getComponent(AngleComponent);
    const rotateComponent = entity.getComponent(RotateComponent);

    angleComponent.angle = normalizeAngle(angleComponent.angle + rotateComponent.rotationDifference);
  }
}
