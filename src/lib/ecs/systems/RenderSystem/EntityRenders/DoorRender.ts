import { ComponentContainer } from "src/lib/ecs/Component.ts";
import TextureComponent from "src/lib/ecs/components/TextureComponent.ts";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import { EntityRender } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";

import { Vec2D } from "src/lib/utils.ts";
import { drawTextureLine } from "./utils";

export class DoorRender extends EntityRender {
    private doorWidth = 0.05;

    canRender(mapEntity: ComponentContainer): boolean {
        return mapEntity.all([TextureComponent, DoorComponent]);
    }

    isRayHit(mapEntity: ComponentContainer, rayX: number, rayY: number) {
        const doorCmp = mapEntity.get(DoorComponent);
        const doorPosition = mapEntity.get(PositionComponent);

        const mainRayCoordinate = doorCmp.isVertical ? rayX : rayY;
        const isAdjacentWall =
            mainRayCoordinate < Math.floor(mainRayCoordinate) + 0.5 - this.doorWidth / 2 ||
            mainRayCoordinate > Math.floor(mainRayCoordinate) + 0.5 + this.doorWidth / 2;

        if (isAdjacentWall) return false;

        return doorCmp.isVertical
            ? rayY > doorPosition.y && rayY < doorPosition.y + 1
            : rayX > doorPosition.x && rayX < doorPosition.x + 1;
    }

    render(screenX: number, mapEntity: ComponentContainer, rayX: number, rayY: number, wallHeight: number, lightLevel?: number) {
        const doorCmp = mapEntity.get(DoorComponent);
        const doorPosition = mapEntity.get(PositionComponent);

        const textureOffset = doorCmp.isVertical
            ? Vec2D.from(rayX - doorPosition.x, Math.floor(rayY) - doorPosition.y)
            : Vec2D.from(Math.floor(rayX) - doorPosition.x, rayY - doorPosition.y);

        const texture = mapEntity.get(TextureComponent).texture;
        const texturePositionX = Math.floor(
            (texture.width * (rayX + textureOffset.x + rayY + textureOffset.y)) % texture.width
        );

        drawTextureLine(
            screenX,
            texturePositionX,
            texture,
            wallHeight,
            this.screenHeight,
            this.canvas,
            lightLevel
        );
    }
}
