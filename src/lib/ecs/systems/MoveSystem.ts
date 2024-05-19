import { degreeToRadians } from "src/lib/utils";
import Entity from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import QuerySystem from "../lib/QuerySystem";
import PositionMap from "../lib/PositionMap";
import CameraComponent from "../components/CameraComponent";
import CircleComponent from "../components/CircleComponent";

export default class MoveSystem extends System {
  requiredComponents = [CircleComponent, PositionComponent, AngleComponent, MoveComponent];
  
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
      this.move(dt, entity);
    });
  }

  protected move(dt: number, entity: Entity) {
    const collisionComponent = entity.getComponent(CollisionComponent);

    if (collisionComponent?.isCollided) {
      return;
    }

    const angleComponent = entity.getComponent(AngleComponent);
    const positionComponent = entity.getComponent(PositionComponent);
    const moveComponent = entity.getComponent(MoveComponent);

    let k = 0;

    if (moveComponent.direction.forward) {
      k = 1;
    }

    if (moveComponent.direction.back) {
      k = -1;
    }

    if (k) {
      const playerCos = Math.cos(degreeToRadians(angleComponent.angle));
      const playerSin = Math.sin(degreeToRadians(angleComponent.angle));
      const newX = positionComponent.x + k * playerCos * moveComponent.moveSpeed * dt;
      const newY = positionComponent.y + k * playerSin * moveComponent.moveSpeed * dt;

      if (newX <= 0 || newX > this.cols) {
        return
      }

      if (newY <= 0 || newY > this.rows) {
        return
      }

      if (!this.positionMap.has(Math.floor(newX), Math.floor(newY))) {
        positionComponent.y = newY;
        positionComponent.x = newX;
      }
    }
  }
}
