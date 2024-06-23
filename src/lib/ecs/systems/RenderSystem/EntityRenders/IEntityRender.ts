import { ComponentContainer } from "src/lib/ecs/Component.ts";
import Canvas from "src/lib/Canvas/BufferCanvas.ts";

export abstract class EntityRender {
    readonly screenHeight: number;
    readonly canvas: Canvas;

    public constructor(screenHeight: number, canvas: Canvas) {
        this.screenHeight = screenHeight;
        this.canvas = canvas;
    }

    abstract canRender(mapEntity: ComponentContainer): boolean;
    abstract isRayHit(mapEntity: ComponentContainer, rayX: number, rayY: number): boolean;
    abstract render(screenX: number, mapEntity: ComponentContainer, rayX: number, rayY: number, wallHeight: number): void;
}
