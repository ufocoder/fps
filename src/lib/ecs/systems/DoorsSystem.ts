import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent.ts";
import BoxComponent from "src/lib/ecs/components/BoxComponent.ts";
import { distance } from "src/lib/utils.ts";

export default class DoorsSystem extends System {
    public readonly componentsRequired = new Set([DoorComponent]);

    private doorsAnimations = new Map<Entity, number>();

    start(): void {}
    destroy(): void {}

    update(dt: number, entities: Set<Entity>) {
        const [player] = this.ecs.query([PlayerComponent]);
        const playerContainer = this.ecs.getComponents(player);
        if (!playerContainer) return;

        const playerPosition = playerContainer.get(PositionComponent);

        entities.forEach(entity => {

            const components = this.ecs.getComponents(entity)
            const door = components.get(DoorComponent);
            const doorBox = components.get(BoxComponent);
            const doorPosition = components.get(PositionComponent);
            if (!door || !doorPosition) return;

            const remainingAnimationTime = this.doorsAnimations.get(entity);
            if (remainingAnimationTime !== undefined) {
                if (remainingAnimationTime <= 0) {
                    this.doorsAnimations.delete(entity);

                    if (door.isOpening) {
                        door.isOpening = false;
                        door.isOpened = true;
                        return;
                    }
                    if (door.isClosing) {
                        door.isClosing = false;
                        door.isOpened = false;
                        return;
                    }
                    return;
                }

                const offset = dt / door.animationTime * doorBox.size;
                this.doorsAnimations.set(entity, remainingAnimationTime - dt);

                if (door.isVertical) {
                    doorPosition.y += door.isOpened ? offset : -offset;
                } else {
                    doorPosition.x += door.isOpened ? offset : -offset;
                }
            } else {
                const toPlayerDistance = distance(playerPosition.x, playerPosition.y, doorPosition.x, doorPosition.y);

                if (!door.isOpened && toPlayerDistance < 1.5) {
                    door.isOpening = true;
                    this.doorsAnimations.set(entity, door.animationTime);
                }

                if (door.isOpened && toPlayerDistance > 2.5) {
                    door.isClosing = true;
                    this.doorsAnimations.set(entity, door.animationTime);
                }
            }
        });
    }
}
