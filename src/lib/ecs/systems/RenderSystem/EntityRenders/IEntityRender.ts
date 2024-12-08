import { ComponentContainer } from "src/lib/ecs/Component.ts";

export type RenderLineInfo = {
  rayX: number;
  rayY: number;
  distance: number;
  texturePositionX: number;
  texture: TextureBitmap;
  entityHeight: number;
};

/** ArmatureEdge = [sx1, sy1, ex1, ey1, sx2, sy2, ex2, ey2...] */
export type ArmatureEdge = number[];

export abstract class EntityRender {
  abstract canRender(mapEntity: ComponentContainer): boolean;

  abstract getArmature(mapEntity: ComponentContainer): ArmatureEdge;

  abstract render(
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
  ): RenderLineInfo | undefined;
}
