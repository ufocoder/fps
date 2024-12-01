import { EntityRender } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";
import { ComponentContainer } from "src/lib/ecs/Component.ts";
import TextureComponent from "src/lib/ecs/components/TextureComponent.ts";

export class WallRender extends EntityRender {
    canRender(mapEntity: ComponentContainer): boolean {
        return mapEntity.has(TextureComponent);
    }

    isRayHit() {
        return true;
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

        const perpWallDist =
            side === 0
                ? (mapX - playerPos.x + (1 - stepX) / 2) / rayDirX
                : (mapY - playerPos.y + (1 - stepY) / 2) / rayDirY;

        // Correct the fish-eye effect
        const correctedDist = perpWallDist * fishEyeFixCoef;

        const wallHeight = Math.floor(this.screenHeight / 2 / correctedDist);

        const rayX = playerPos.x + rayDirX * perpWallDist;
        const rayY = playerPos.y + rayDirY * perpWallDist;

        const texture = mapEntity.get(TextureComponent).texture;
        const texturePositionX = Math.floor(
            (texture.width * (rayX + rayY)) % texture.width
        );

        const lightLevel = this.lightSystem?.getLightingLevelForPoint(rayX, rayY) ?? 1;
        return {
            texturePositionX: texturePositionX,
            texture: texture,
            entityHeight: wallHeight,
            lightLevel: lightLevel
        }
    }
}
