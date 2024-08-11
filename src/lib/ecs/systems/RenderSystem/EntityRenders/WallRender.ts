import BaseRender from "src/lib/ecs/systems/RenderSystem/EntityRenders/BaseRender.ts";
import { ComponentContainer } from "src/lib/ecs/Component.ts";
import TextureComponent from "src/lib/ecs/components/TextureComponent.ts";

export default class WallRender extends BaseRender {
    canRender(mapEntity: ComponentContainer): boolean {
        return mapEntity.has(TextureComponent);
    }

    isRayHit() {
        return true;
    }

    render(screenX: number, mapEntity: ComponentContainer, rayX: number, rayY: number, wallHeight: number) {
        const texture = mapEntity.get(TextureComponent).texture;
        const texturePositionX = Math.floor(
            (texture.width * (rayX + rayY)) % texture.width
        );

        this.drawTextureLine(
            screenX,
            texturePositionX,
            texture,
            wallHeight,
            this.screenHeight,
            this.canvas
        );
    }
}
