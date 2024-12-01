import MapTextureSystem from "../MapTextureSystem";
// import MapPolarSystem from "../MapPolarSystem";
import { PolarPosition } from "src/lib/ecs/lib/PolarMap";
import ECS from "src/lib/ecs";
import System from "src/lib/ecs/System";
import { ComponentContainer } from "src/lib/ecs/Component";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SpriteComponent from "src/lib/ecs/components/SpriteComponent";
import Canvas from "src/lib/Canvas/BufferCanvas";
import TextureManager from "src/managers/TextureManager";

import { degreeToRadians, normalizeAngle } from "src/lib/utils";

import { EntityRender, RenderLineInfo } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";
import { WallRender } from "./EntityRenders/WallRender.ts";
import { DoorRender } from "./EntityRenders/DoorRender.ts";
import { applyLight } from "src/lib/ecs/systems/RenderSystem/light.ts";
import LightSystem from "src/lib/ecs/systems/LightSystem.ts";

export default class RenderSystem extends System {
    public readonly componentsRequired = new Set([PositionComponent]);

    protected readonly width: number = 640;
    protected readonly height: number = 480;
    protected readonly rayMaxDistanceRay = 20;
    protected readonly rayPrecision = 128;
    protected player = {
        pos: {x: 0, y: 0},
        angle: 0
    };

    protected readonly level: Level;
    protected readonly canvas: Canvas;
    protected readonly container: HTMLElement;
    protected readonly textureManager: TextureManager;

    private mapEntityRenders: EntityRender[] = [];
    // private levelLights: { position: Vector2D, cmp: LightComponent }[] = [];
    private lightSystem?: LightSystem;

    constructor(ecs: ECS, container: HTMLElement, level: Level, textureManager: TextureManager) {
        super(ecs);

        this.level = level;
        this.container = container;

        this.canvas = new Canvas({
            id: 'camera',
            height: this.height,
            width: this.width,
        });

        this.textureManager = textureManager;
    }

    start() {
        this.container.appendChild(this.canvas.element);
        this.lightSystem = this.ecs.getSystem(LightSystem);

        this.mapEntityRenders = [
            new DoorRender(this.height, this.canvas, this.lightSystem),
            new WallRender(this.height, this.canvas, this.lightSystem),
        ];
    }

    update() {
        const [player] = this.ecs.query([PlayerComponent]);
        const playerContainer = this.ecs.getComponents(player);

        if (!playerContainer) return;

        const posCmp = playerContainer.get(PositionComponent);
        const angleCmp = playerContainer.get(AngleComponent);
        this.player = {
            pos: posCmp,
            angle: angleCmp.angle
        }

        this.canvas.createBufferSnapshot();
        this.render(playerContainer);
        this.canvas.commitBufferSnapshot();
    }

    destroy(): void {
        this.canvas.element.remove();
    }

    render(player: ComponentContainer) {
        const playerFov = player.get(CameraComponent);
        const textureMap = this.ecs.getSystem(MapTextureSystem)!.textureMap;

        let rayAngle = normalizeAngle(this.player.angle - playerFov.fov / 2);


        for (let screenX = 0; screenX < this.width; screenX++) {
            // Calculate the ray direction based on the current angle
            const rayRad = degreeToRadians(rayAngle);
            const fishEyeFixCoef = Math.cos(degreeToRadians(rayAngle - this.player.angle));

            // Calculate the direction vector of the ray using trigonometric functions
            const rayDirX = Math.cos(rayRad);
            const rayDirY = Math.sin(rayRad);

            // Determine the player's position in the grid by flooring their coordinates
            let mapX = Math.floor(this.player.pos.x);
            let mapY = Math.floor(this.player.pos.y);

            // Calculate the distance to the next vertical and horizontal grid lines
            const deltaDistX = Math.abs(1 / rayDirX);
            const deltaDistY = Math.abs(1 / rayDirY);

            let stepX, stepY;

            // distance the ray has to travel from its start position to the first x-side and the first y-side.
            // Later in the code they will be incremented while steps are taken.
            let sideDistX, sideDistY;

            // Determine the step direction and initial distance to the next vertical grid line
            if (rayDirX < 0) {
                stepX = -1;
                sideDistX = (this.player.pos.x - mapX) * deltaDistX;
            } else {
                stepX = 1;
                sideDistX = (mapX + 1.0 - this.player.pos.x) * deltaDistX;
            }

            if (rayDirY < 0) {
                stepY = -1;
                sideDistY = (this.player.pos.y - mapY) * deltaDistY;
            } else {
                stepY = 1;
                sideDistY = (mapY + 1.0 - this.player.pos.y) * deltaDistY;
            }

            // Initialize the side variable to indicate whether the last hit was vertical or horizontal
            let side = 0; // 0 for vertical, 1 for horizontal

            let mapEntity: ComponentContainer | undefined;
            let renderer: EntityRender | undefined;
            let isPropagating = true;

            // Perform DDA
            while (isPropagating) {

                // Determine whether to move horizontally or vertically based on which is closer
                if (sideDistX < sideDistY) {
                    sideDistX += deltaDistX;
                    mapX += stepX;
                    side = 0;
                } else {
                    sideDistY += deltaDistY;
                    mapY += stepY;
                    side = 1;
                }

                // Check for a hit
                mapEntity = textureMap.get(mapX, mapY);
                if (mapEntity) {
                    renderer = this.mapEntityRenders.find(render => render.canRender(mapEntity!));
                    isPropagating = !renderer?.isRayHit(mapEntity, side, sideDistX, sideDistY, deltaDistX, deltaDistY, mapX, mapY, this.player.pos, stepX, stepY, rayDirX, rayDirY);
                }
            }

            if (mapEntity && renderer) {
                const renderInfo = renderer.render(mapEntity, side, mapX, mapY, this.player.pos, stepX, stepY, rayDirX, rayDirY, fishEyeFixCoef,);

                this.drawTextureLine(screenX, renderInfo);
                this._drawFloorLine(screenX, renderInfo.entityHeight, rayAngle);
            } else {
                this._drawFloorLine(screenX, 0, rayAngle);
            }

            // Advance to the next ray
            rayAngle += normalizeAngle(playerFov.fov / this.width);
        }

    }

    _getLightPower(rayX: number, rayY: number) {
        return this.lightSystem?.getLightingLevelForPoint(rayX, rayY) ?? 1;
    }

    drawTextureLine(screenX: number,{ entityHeight, lightLevel, texture, texturePositionX }: RenderLineInfo) {
        const yIncrementer = (entityHeight * 2) / texture.height;
        let y = this.height / 2 - entityHeight;

        for (let i = 0; i < texture.height; i++) {
            if (y > -yIncrementer && y < this.height) {
                this.canvas.drawVerticalLine({
                    x: screenX,
                    y1: y,
                    y2: Math.floor(y + yIncrementer),
                    color: applyLight(texture.colors[i][texturePositionX], lightLevel),
                });
            }
            y += yIncrementer;
        }
    }


    _drawHorizonLine(x: number, wallHeight: number) {
        this.canvas.drawVerticalLine({
            x,
            y1: 0,
            y2: this.height / 2 - wallHeight,
            color: this.level.world.colors.top,
        });

        this.canvas.drawVerticalLine({
            x,
            y1: this.height / 2 + wallHeight,
            y2: this.height,
            color: this.level.world.colors.bottom,
        });
    }

    _drawSpriteLine(screenX: number, rayAngle: number, polarEntity: PolarPosition) {
        const animateSprite = polarEntity.container.get(AnimatedSpriteComponent)?.sprite;
        const staticSprite = polarEntity.container.get(SpriteComponent)?.sprite;
        const spritePosition = polarEntity.container.get(PositionComponent);
        const projectionHeight = Math.floor(this.height / 2 / polarEntity.distance);
        const sprite = animateSprite || staticSprite;

        const a1 = normalizeAngle(rayAngle - polarEntity.angleFrom);
        const a2 = normalizeAngle(polarEntity.angleTo - polarEntity.angleFrom);
        const xTexture = Math.floor(a1 / a2 * sprite.width)

        const yIncrementer = (projectionHeight * 2) / sprite.height;

        let y = this.height / 2 - projectionHeight;

        const lightLevel = this._getLightPower(spritePosition!.x, spritePosition!.y);

        for (let i = 0; i < sprite.height; i++) {
            if (y > -yIncrementer && y < this.height) {
                this.canvas.drawVerticalLine({
                    x: screenX,
                    y1: y,
                    y2: Math.floor(y + yIncrementer),
                    color: applyLight(sprite.colors[i][xTexture], lightLevel),
                });
            }
            y += yIncrementer;
        }
    }

    _drawFloorLine(
        x: number,
        wallHeight: number,
        rayAngle: number,
    ) {
        const texture = this.textureManager.get('floor');

        const halfHeight = this.height / 2;
        const start = halfHeight + wallHeight + 1;

        const rayAngleRad = degreeToRadians(rayAngle);
        const directionCos = Math.cos(rayAngleRad);
        const directionSin = Math.sin(rayAngleRad);

        const playerAngleRad = degreeToRadians(this.player.angle);
        const angleDiffCos = 1 / Math.cos(playerAngleRad - rayAngleRad);

        for (let y = start; y < this.height; y++) {
            const distance = this.height / (2 * y - this.height) * angleDiffCos;

            const tileX = distance * directionCos + this.player.pos.x;
            const tileY = distance * directionSin + this.player.pos.y;

            const lightLevel = this._getLightPower(tileX, tileY);

            if (lightLevel === 0) continue;

            const textureX = Math.abs(Math.floor(tileX * texture.width)) % texture.width;
            const textureY = Math.abs(Math.floor(tileY * texture.height)) % texture.height;
            const color = applyLight(texture.colors[textureX][textureY], lightLevel);

            this.canvas.drawPixel({x, y, color});
        }
    }
}
