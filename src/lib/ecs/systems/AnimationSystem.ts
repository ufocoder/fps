import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";

export default class AnimationSystem extends System {
  public readonly componentsRequired = new Set([AnimatedSpriteComponent]);

  start(): void {}

  update(dt: number, entities: Set<Entity>) {
    entities.forEach((entity) => {
      this.ecs.getComponents(entity).get(AnimatedSpriteComponent).update(dt);
    });
  }

  destroy(): void {}
}
