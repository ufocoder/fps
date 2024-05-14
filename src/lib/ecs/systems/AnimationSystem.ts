import Entity from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import AnimatedSpriteComponent from "../components/AnimationComponent";


export default class AnimationSystem extends System {
  requiredComponents = [AnimatedSpriteComponent];

  start(): void {}

  update(dt: number, entities: Entity[]) {
    entities.forEach((entity) => {
      entity.getComponent(AnimatedSpriteComponent).update(dt);
    });
  }

  destroy(): void {}
}
