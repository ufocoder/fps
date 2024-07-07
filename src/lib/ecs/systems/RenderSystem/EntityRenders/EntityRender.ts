import { ComponentContainer } from "src/lib/ecs/Component.ts";
import Canvas from "src/lib/Canvas/BufferCanvas.ts";

export default abstract class EntityRender {
    readonly screenHeight: number;
    readonly canvas: Canvas;

    public constructor(screenHeight: number, canvas: Canvas) {
        this.screenHeight = screenHeight;
        this.canvas = canvas;
    }

    abstract canRender(mapEntity: ComponentContainer): boolean;
    abstract isRayHit(mapEntity: ComponentContainer, rayX: number, rayY: number): boolean;
    abstract render(screenX: number, mapEntity: ComponentContainer, rayX: number, rayY: number, wallHeight: number): void;

    drawTextureLine(
        screenX: number,
        texturePositionX: number,
        texture: TextureBitmap,
        entityHeight: number,
        screenHeight: number,
        canvas: Canvas,
    ) {
        const yIncrementer = (entityHeight * 2) / texture.height;
        let y = screenHeight / 2 - entityHeight;
    
        for (let i = 0; i < texture.height; i++) {
            if (y > -yIncrementer && y < screenHeight) {
                canvas.drawVerticalLine({
                    x: screenX,
                    y1: y,
                    y2: Math.floor(y + yIncrementer),
                    color: texture.colors[i][texturePositionX],
                });
            }
            y += yIncrementer;
        }
    }
    
}
