import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent.ts";
import BoxComponent from "src/lib/ecs/components/BoxComponent.ts";
import { distance } from "src/lib/utils.ts";

export default class DoorsSystem extends System {
  public readonly componentsRequired = new Set([DoorComponent]);

  private doorsAnimations = new Map<Entity, { remainingAnimationTime: number }>();

  start(): void {}
  destroy(): void {}

  update(dt: number, entities: Set<Entity>) {
    const [player] = this.ecs.query([PlayerComponent]);
    const playerContainer = this.ecs.getComponents(player);
    if (!playerContainer) return;

    const playerPosition = playerContainer.get(PositionComponent);

    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);
      const door = components.get(DoorComponent);
      const doorBox = components.get(BoxComponent);
      const doorPosition = components.get(PositionComponent);
      if (!door || !doorPosition) return;

      const anim = this.doorsAnimations.get(entity);
      if (anim) {
        if (anim.remainingAnimationTime <= 0) {
          this.doorsAnimations.delete(entity);
          door.isOpened = !door.isOpened;
          door.offset = door.isOpened ? doorBox.size : 0;
          return;
        }

        const offset = (dt / door.animationTime) * doorBox.size;
        const axisOffset = door.isOpened ? -offset : offset;
        door.offset += axisOffset;

        anim.remainingAnimationTime = anim.remainingAnimationTime - dt;
      } else {
        const toPlayerDistance = distance(
          playerPosition.x,
          playerPosition.y,
          doorPosition.x,
          doorPosition.y
        );

        if ((!door.isOpened && toPlayerDistance < 1.5) || (door.isOpened && toPlayerDistance > 2.5)) {
          this.doorsAnimations.set(entity, { remainingAnimationTime: door.animationTime });
        }
      }
    });
  }
}
