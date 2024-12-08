import { ComponentContainer } from "src/lib/ecs/Component.ts";
import TextureComponent from "src/lib/ecs/components/TextureComponent.ts";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import { EntityRender } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";

import { Vec2D } from "src/lib/utils/math";
import { degreeToRadians, normalizeAngleInRad } from "src/lib/utils/angle";

export class DoorRender extends EntityRender {
  private doorWidth = 0.1;

  canRender(mapEntity: ComponentContainer): boolean {
    return mapEntity.all([TextureComponent, DoorComponent]);
  }

  getArmature(mapEntity: ComponentContainer) {
    const pos = mapEntity.get(PositionComponent);
    const door = mapEntity.get(DoorComponent);
    const halfDoorWidth = this.doorWidth / 2;
    if (!door.isVertical) {
      return [
        // top
        pos.x + door.offset,
        pos.y + 0.5 - halfDoorWidth,
        pos.x + 1,
        pos.y + 0.5 - halfDoorWidth,
        // bottom
        pos.x + door.offset,
        pos.y + 0.5 + halfDoorWidth,
        pos.x + 1,
        pos.y + 0.5 + halfDoorWidth,
        // left
        pos.x + door.offset,
        pos.y + 0.5 - halfDoorWidth,
        pos.x + door.offset,
        pos.y + 0.5 + halfDoorWidth,
        // right
        pos.x + 1,
        pos.y + 0.5 - halfDoorWidth,
        pos.x + 1,
        pos.y + 0.5 + halfDoorWidth,
      ];
    }
    return [
      // top
      pos.x + 0.5 - halfDoorWidth,
      pos.y + door.offset,
      pos.x + 0.5 + halfDoorWidth,
      pos.y + door.offset,
      // bottom
      pos.x + 0.5 - halfDoorWidth,
      pos.y + 1,
      pos.x + 0.5 + halfDoorWidth,
      pos.y + 1,
      // left
      pos.x + 0.5 - halfDoorWidth,
      pos.y + door.offset,
      pos.x + 0.5 - halfDoorWidth,
      pos.y + 1,
      // right
      pos.x + 0.5 + halfDoorWidth,
      pos.y + door.offset,
      pos.x + 0.5 + halfDoorWidth,
      pos.y + 1,
    ];
  }

  render(
    mapEntity: ComponentContainer,
    screenHeight: number,
    rayAngle: number,
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
    fishEyeFixCoef: number,
  ) {
    const doorCmp = mapEntity.get(DoorComponent);
    const doorPosition = mapEntity.get(PositionComponent);

    let doorPositionX = doorPosition.x;
    let doorPositionY = doorPosition.y;
    if (side === 1) {
      doorPositionX += doorCmp.offset;
    } else {
      doorPositionY += doorCmp.offset;
    }

    const isDoorOpened =
      side === 1 ? doorPositionX >= mapX + 1 : doorPositionY >= mapY + 1;
    if (isDoorOpened) return;

    const isHitWall =
      side === 1
        ? sideDistY - deltaDistY * (0.5 + this.doorWidth / 2) > sideDistX
        : sideDistX - deltaDistX * (0.5 + this.doorWidth / 2) > sideDistY;

    if (isHitWall) return;

    let hitDoorPart: "frontFace" | "sideFace" | null = null;

    let offset =
      side === 0
        ? stepX * (0.5 - this.doorWidth / 2)
        : stepY * (0.5 - this.doorWidth / 2);

    const perpWallDistOnFrontFace = this.calculatePerpWallDist(
      side,
      mapX,
      mapY,
      playerPos,
      stepX,
      stepY,
      rayDirX,
      rayDirY,
      offset,
    );

    let rayX = playerPos.x + rayDirX * perpWallDistOnFrontFace;
    let rayY = playerPos.y + rayDirY * perpWallDistOnFrontFace;

    // check front hit closing/opening door
    const isHitDoor = side === 1 ? rayX > doorPositionX : rayY > doorPositionY;

    if (isHitDoor) {
      hitDoorPart = "frontFace";
    }

    if (!hitDoorPart) {
      const rayAngleRad = degreeToRadians(rayAngle);
      if (side === 1) {
        const closestDoorCornetPoint = {
          x: doorPositionX,
          y: mapY + 0.5 - this.doorWidth / 2,
        };
        const angToClosestCorner = normalizeAngleInRad(
          Math.atan2(
            closestDoorCornetPoint.y - playerPos.y,
            closestDoorCornetPoint.x - playerPos.x,
          ),
        );
        const angleToFaresCorner = normalizeAngleInRad(
          Math.atan2(
            closestDoorCornetPoint.y + this.doorWidth - playerPos.y,
            closestDoorCornetPoint.x - playerPos.x,
          ),
        );
        if (
          rayAngleRad > angToClosestCorner &&
          rayAngleRad < angleToFaresCorner
        ) {
          hitDoorPart = "sideFace";
          const angle =
            rayAngleRad < Math.PI ? rayAngleRad : rayAngleRad - Math.PI;

          const leg = doorPositionX - rayX;
          const hypotenuse = leg / Math.cos(angle);
          offset += Math.sqrt(hypotenuse ** 2 - leg ** 2) * stepY;
        } else {
          return;
        }
      } else {
        const closestDoorCornetPoint = {
          x: mapX + 0.5 - this.doorWidth / 2,
          y: doorPositionY,
        };
        const angToClosestCorner = Math.atan2(
          closestDoorCornetPoint.y - playerPos.y,
          closestDoorCornetPoint.x - playerPos.x,
        );
        const angleToFaresCorner = Math.atan2(
          closestDoorCornetPoint.y - playerPos.y,
          closestDoorCornetPoint.x + this.doorWidth - playerPos.x,
        );
        if (
          rayAngleRad > angleToFaresCorner &&
          rayAngleRad < angToClosestCorner
        ) {
          hitDoorPart = "sideFace";
          const leg = doorPositionY - rayY;
          const hypotenuse = leg / Math.sin(rayAngleRad);
          offset += Math.sqrt(hypotenuse ** 2 - leg ** 2) * stepX;
        } else {
          return;
        }
      }
    }

    if (!hitDoorPart) return;

    const perpWallDist = this.calculatePerpWallDist(
      side,
      mapX,
      mapY,
      playerPos,
      stepX,
      stepY,
      rayDirX,
      rayDirY,
      offset,
    );

    rayX = playerPos.x + rayDirX * perpWallDist;
    rayY = playerPos.y + rayDirY * perpWallDist;

    // Determine texture offset based on the door's orientation
    const textureOffset = doorCmp.isVertical
      ? Vec2D.from(rayX - doorPositionX, Math.floor(rayY) - doorPositionY)
      : Vec2D.from(Math.floor(rayX) - doorPositionX, rayY - doorPositionY);

    const texture = mapEntity.get(TextureComponent).texture;

    // Calculate texture X-coordinate
    const texturePositionX =
      hitDoorPart === "frontFace"
        ? Math.floor(
            (texture.width *
              (rayX + textureOffset.x + rayY + textureOffset.y)) %
              texture.width,
          )
        : 0;

    // Correct the fish-eye effect
    const correctedDist = perpWallDist * fishEyeFixCoef;
    const wallHeight = Math.floor(screenHeight / 2 / correctedDist);

    return {
      rayX,
      rayY,
      texturePositionX: texturePositionX,
      texture: texture,
      entityHeight: wallHeight,
      distance: correctedDist,
    };
  }

  calculatePerpWallDist(
    side: number,
    mapX: number,
    mapY: number,
    startRayPos: Vector2D,
    stepX: number,
    stepY: number,
    rayDirX: number,
    rayDirY: number,
    offset: number = 0,
  ) {
    return side === 0
      ? Math.abs((mapX - startRayPos.x + offset + (1 - stepX) / 2) / rayDirX)
      : Math.abs((mapY - startRayPos.y + offset + (1 - stepY) / 2) / rayDirY);
  }
}
