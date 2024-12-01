import { ComponentContainer } from "src/lib/ecs/Component.ts";
import TextureComponent from "src/lib/ecs/components/TextureComponent.ts";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import { EntityRender } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";

import { Vec2D } from "src/lib/utils.ts";

export class DoorRender extends EntityRender {
    private doorWidth = 0.05; // Defines the door's thickness

    canRender(mapEntity: ComponentContainer): boolean {
        return mapEntity.all([TextureComponent, DoorComponent]);
    }

    isRayHit(
        mapEntity: ComponentContainer,
        side: number,
        sideDistX: number,
        sideDistY: number,
        deltaDistX: number,
        deltaDistY: number,
        mapX: number,
        mapY: number,
        playerPos: Vector2D,
        stepX: number,
        stepY: number,
        rayDirX: number,
        rayDirY: number,
    ): boolean {
        if (side == 1) {
            if (sideDistY - (deltaDistY/2) > sideDistX) return false;
        } else {
            if ((sideDistX - (deltaDistX/2) > sideDistY)) return false;
        }

        const perpWallDist = this.calculatePerpWallDist(
            side,
            mapX,
            mapY,
            playerPos,
            stepX,
            stepY,
            rayDirX,
            rayDirY,
        );

        const rayX = playerPos.x + rayDirX * perpWallDist;
        const rayY = playerPos.y + rayDirY * perpWallDist;

        const doorCmp = mapEntity.get(DoorComponent);
        const doorPosition = mapEntity.get(PositionComponent);

        // // Ensure the intersection point lies within the door's cell boundaries
        return doorCmp.isVertical
            ? rayY > doorPosition.y && rayY < doorPosition.y + 1
            : rayX > doorPosition.x && rayX < doorPosition.x + 1;
    }

    render(
        mapEntity: ComponentContainer,
        side: number,
        mapX: number,
        mapY: number,
        playerPos: Vector2D,
        stepX: number,
        stepY: number,
        rayDirX: number,
        rayDirY: number,
        fishEyeFixCoef: number,
    ) {
        const doorCmp = mapEntity.get(DoorComponent);
        const doorPosition = mapEntity.get(PositionComponent);

        const perpWallDist = this.calculatePerpWallDist(
            side,
            mapX,
            mapY,
            playerPos,
            stepX,
            stepY,
            rayDirX,
            rayDirY
        )

        // Correct the fish-eye effect
        const correctedDist = perpWallDist * fishEyeFixCoef;

        const wallHeight = Math.floor(this.screenHeight / 2 / correctedDist);
        const rayX = playerPos.x + rayDirX * perpWallDist;
        const rayY = playerPos.y + rayDirY * perpWallDist;

        // Determine texture offset based on the door's orientation
        const textureOffset = doorCmp.isVertical
            ? Vec2D.from(rayX - doorPosition.x, Math.floor(rayY) - doorPosition.y)
            : Vec2D.from(Math.floor(rayX) - doorPosition.x, rayY - doorPosition.y);

        const texture = mapEntity.get(TextureComponent).texture;

        // Calculate texture X-coordinate
        const texturePositionX = Math.floor(
            (texture.width * (rayX + textureOffset.x + rayY + textureOffset.y)) % texture.width
        );

        const lightLevel = this.lightSystem?.getLightingLevelForPoint(rayX, rayY) ?? 1;
        return {
            texturePositionX: texturePositionX,
            texture: texture,
            entityHeight: wallHeight,
            lightLevel: lightLevel
        };
    }

    calculatePerpWallDist(
        side: number,
        mapX: number,
        mapY: number,
        playerPos: Vector2D,
        stepX: number,
        stepY: number,
        rayDirX: number,
        rayDirY: number,
    ) {
        if (side === 1) {
            const offset = stepY / 2;
             return (mapY - playerPos.y + offset + (1 - stepY) / 2) / rayDirY;
        } else {
            const offset = stepX / 2;
            return (mapX - playerPos.x + offset + (1 - stepX) / 2) / rayDirX;
        }
    }
}
