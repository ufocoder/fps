import { degreeToRadians, normalizeAngle } from "src/lib/utils";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import PositionMap from "src/lib/ecs/lib/PositionMap";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import { ComponentContainer } from "src/lib/ecs/Component";
import ECS from "..";

export default class MoveSystem extends System {
  componentsRequired = new Set([PositionComponent, AngleComponent, RotateComponent, MoveComponent]);
  
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
    const { rotationFactor, rotationSpeed } = components.get(RotateComponent);

    angleComponent.angle = normalizeAngle(angleComponent.angle + rotationFactor * rotationSpeed * dt);
  }

  protected move(dt: number, entity: Entity) {
    const components = this.ecs.getComponents(entity)
    const collisionComponent = components.get(CollisionComponent);

    if (collisionComponent?.isCollided) {
      return;
    }

    const angleComponent = components.get(AngleComponent);
    const positionComponent = components.get(PositionComponent);
    const { mainDirection, sideDirection, moveSpeed } = components.get(MoveComponent);

    const m = Number(mainDirection);
    const s = Number(sideDirection) * (-1);

    if (m || s) {
      const mainAngle = degreeToRadians(angleComponent.angle);
      const mainCos = Math.cos(mainAngle);
      const mainSin = Math.sin(mainAngle);
      if (entity === 1) {
        console.log('angle', angleComponent.angle, 'cos', mainCos, 'sin', mainSin)
      }
      const sideAngle = degreeToRadians(angleComponent.angle - 90);
      const sideCos = Math.cos(sideAngle);
      const sideSin = Math.sin(sideAngle);

      const newX = positionComponent.x + (m * mainCos + s * sideCos) * moveSpeed * dt;
      const newY = positionComponent.y + (m * mainSin + s * sideSin) * moveSpeed * dt;

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
