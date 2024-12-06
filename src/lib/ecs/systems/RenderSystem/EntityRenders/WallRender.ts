import { EntityRender } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";
import { ComponentContainer } from "src/lib/ecs/Component.ts";
import TextureComponent from "src/lib/ecs/components/TextureComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";

export class WallRender extends EntityRender {
  canRender(mapEntity: ComponentContainer): boolean {
    return mapEntity.has(TextureComponent);
  }

  getArmature(mapEntity: ComponentContainer) {
    const pos = mapEntity.get(PositionComponent);
    return [
      pos.x,
      pos.y,
      pos.x + 1,
      pos.y,
      pos.x,
      pos.y,
      pos.x,
      pos.y + 1,
      pos.x + 1,
      pos.y + 1,
      pos.x,
      pos.y + 1,
      pos.x + 1,
      pos.y + 1,
      pos.x + 1,
      pos.y,
    ];
  }

  render(
    mapEntity: ComponentContainer,
    screenHeight: number,
    _rayAngle: number,
    side: number,
    _sideDistX: number,
    _sideDistY: number,
    _deltaDistX: number,
    _deltaDistY: number,
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

    const wallHeight = Math.floor(screenHeight / 2 / correctedDist);

    const rayX = playerPos.x + rayDirX * perpWallDist;
    const rayY = playerPos.y + rayDirY * perpWallDist;

    const texture = mapEntity.get(TextureComponent).texture;
    const texturePositionX = Math.floor(
      (texture.width * (rayX + rayY)) % texture.width,
    );

    return {
      texturePositionX: texturePositionX,
      texture: texture,
      entityHeight: wallHeight,
      rayX,
      rayY,
      distance: correctedDist,
    };
  }
}
