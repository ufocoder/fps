import Canvas from "src/lib/Canvas/BufferCanvas";
import { applyLight } from "src/lib/ecs/systems/RenderSystem/light.ts";

export function drawTextureLine(
    screenX: number,
    texturePositionX: number,
    texture: TextureBitmap,
    entityHeight: number,
    screenHeight: number,
    canvas: Canvas,
    lightLevel?: number
) {
    const yIncrementer = (entityHeight * 2) / texture.height;
    let y = screenHeight / 2 - entityHeight;

    for (let i = 0; i < texture.height; i++) {
        if (y > -yIncrementer && y < screenHeight) {
            canvas.drawVerticalLine({
                x: screenX,
                y1: y,
                y2: Math.floor(y + yIncrementer),
                color: applyLight(texture.colors[i][texturePositionX], lightLevel),
            });
        }
        y += yIncrementer;
    }
}
