import { normalizeAngle } from "src/lib/utils";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";

export default class RotationSystem extends System {
  componentsRequired = new Set([AngleComponent, RotateComponent]);
  
  start(): void {}
  destroy(): void {}

  update(dt: number, entities: Set<Entity>) {
    entities.forEach(entity => {
      this.rotate(dt, entity);
    });
  }

  protected rotate(_: number, entity: Entity) {
    const components = this.ecs.getComponents(entity)
    const angleComponent = components.get(AngleComponent);
    const rotateComponent = components.get(RotateComponent);

    angleComponent.angle = normalizeAngle(angleComponent.angle + rotateComponent.rotationDifference);
  }
}
