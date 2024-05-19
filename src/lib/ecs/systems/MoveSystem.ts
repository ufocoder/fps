import { degreeToRadians, normalizeAngle } from "src/lib/utils";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import PositionMap from "../lib/PositionMap";
import CameraComponent from "../components/CameraComponent";
import CircleComponent from "../components/CircleComponent";
import { ComponentContainer } from "../Component";
import ECS from "..";

export default class MoveSystem extends System {
  componentsRequired = new Set([CircleComponent, PositionComponent, AngleComponent, RotateComponent, MoveComponent]);
  
  protected positionMap: PositionMap<ComponentContainer>;
  protected cols: number;
  protected rows: number;

  constructor(ecs: ECS, level: Level) {
    super(ecs);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.positionMap = new PositionMap(cols, rows);
    
    this.cols = cols;
    this.rows = rows;
  }
  
  start(): void {
    this.ecs.query([PositionComponent, CollisionComponent]).forEach(container => {
      if (container.has(CameraComponent)) {
        return;
      }

      const position = container.get(PositionComponent);

      this.positionMap.set(
        Math.floor(position.x),
        Math.floor(position.y),
        container
      );
    })
  }

  destroy(): void {}

  update(dt: number, entities: Set<Entity>) {
    entities.forEach(entity => {
      this.rotate(dt, entity);
      this.move(dt, entity);
    });
  }

  protected rotate(dt: number, entity: Entity) {
    const components = this.ecs.getComponents(entity)
    const angleComponent = components.get(AngleComponent);
    const rotateComponent = components.get(RotateComponent);

    let k = 0;

    if (rotateComponent.direction.right) {
      k = 1;
    }

    if (rotateComponent.direction.left) {
      k = -1;
    }

    if (k) {
      angleComponent.angle = normalizeAngle(angleComponent.angle + k * rotateComponent.rotationSpeed * dt);
    }
  }

  protected move(dt: number, entity: Entity) {
    const components = this.ecs.getComponents(entity)
    const collisionComponent = components.get(CollisionComponent);

    if (collisionComponent?.isCollided) {
      return;
    }

    const angleComponent = components.get(AngleComponent);
    const positionComponent = components.get(PositionComponent);
    const moveComponent = components.get(MoveComponent);

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
