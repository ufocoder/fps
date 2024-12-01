import { ComponentContainer } from "src/lib/ecs/Component.ts";
import Canvas from "src/lib/Canvas/BufferCanvas.ts";
import LightSystem from "src/lib/ecs/systems/LightSystem.ts";

export type RenderLineInfo = {
    texturePositionX: number,
    texture: TextureBitmap,
    entityHeight: number,
    lightLevel?: number
}

export abstract class EntityRender {
    readonly screenHeight: number;
    readonly canvas: Canvas;
    readonly lightSystem?: LightSystem;

    public constructor(screenHeight: number, canvas: Canvas, lightSystem?: LightSystem) {
        this.screenHeight = screenHeight;
        this.canvas = canvas;
        this.lightSystem = lightSystem;
    }

    abstract canRender(mapEntity: ComponentContainer): boolean;
    abstract isRayHit(
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
    ): boolean;
    abstract render(
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
    ): RenderLineInfo;
}
