import { normalizeAngle } from "src/lib/utils";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";

export default class RotateSystem extends System {
  componentsRequired = new Set([AngleComponent, RotateComponent]);
  
  start(): void {}

  destroy(): void {}

  update(dt: number, entities: Set<Entity>) {
    entities.forEach(entity => {
      const components = this.ecs.getComponents(entity)
      const angleComponent = components.get(AngleComponent);
      const { rotationFactor, rotationSpeed } = components.get(RotateComponent);

      angleComponent.angle = normalizeAngle(angleComponent.angle + rotationFactor * rotationSpeed * dt);
    });
  }
}
