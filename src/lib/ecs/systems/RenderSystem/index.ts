import MapTextureSystem from "../MapTextureSystem";
import MapPolarSystem from "../MapPolarSystem";
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

import { degreeToRadians, distance, normalizeAngle } from "src/lib/utils";

import { EntityRender } from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";
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
            new DoorRender(this.height, this.canvas),
            new WallRender(this.height, this.canvas),
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

            const incrementRayX =
                Math.cos(degreeToRadians(rayAngle)) / this.rayPrecision;
            const incrementRayY =
                Math.sin(degreeToRadians(rayAngle)) / this.rayPrecision;

            let rayX = this.player.pos.x;
            let rayY = this.player.pos.y;

            let distanceRay = 0;
            let mapEntity: ComponentContainer | undefined;
            let isPropagating = true;
            let renderer: EntityRender | undefined;

            while (isPropagating) {
                rayX += incrementRayX;
                rayY += incrementRayY;

                if (rayX < 0 || rayX > textureMap.cols) {
                    isPropagating = false;
                    continue;
                }

                if (rayY < 0 || rayY > textureMap.rows) {
                    isPropagating = false;
                    continue;
                }

                mapEntity = textureMap.get(Math.floor(rayX), Math.floor(rayY));

                if (mapEntity !== undefined) {
                    renderer = this.mapEntityRenders.find(render => render.canRender(mapEntity!));
                    isPropagating = !renderer?.isRayHit(mapEntity!, rayX, rayY);
                }

                distanceRay = distance(
                    this.player.pos.x,
                    this.player.pos.y,
                    rayX,
                    rayY,
                );

                if (distanceRay >= this.rayMaxDistanceRay) {
                    isPropagating = false;
                }
            }

            const normalizedDistanceRay =
                distanceRay * Math.cos(degreeToRadians(rayAngle - this.player.angle));

            const wallHeight = Math.floor(this.height / 2 / normalizedDistanceRay);


            if (mapEntity && renderer) {
                const lightLevel = this._getLightPower(rayX, rayY);
                renderer.render(screenX, mapEntity, rayX, rayY, wallHeight, lightLevel);
                this._drawFloorLine(screenX, wallHeight, rayAngle);
            } else {
                this._drawFloorLine(screenX, 0, rayAngle);
            }

            const incrementAngle = playerFov.fov / this.width;
            const polarMap = this.ecs.getSystem(MapPolarSystem)!.polarMap;

            polarMap
                .select(distanceRay, rayAngle, rayAngle + incrementAngle)
                .forEach(polarEntity => {
                    this._drawSpriteLine(screenX, rayAngle, polarEntity);
                });

            rayAngle += normalizeAngle(incrementAngle);
        }
    }

    _getLightPower(rayX: number, rayY: number) {
        return this.lightSystem?.getLightingLevelForPoint(rayX, rayY) ?? 1;
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

        for (let y = start; y < this.height; y++) {
            let distance = this.height / (2 * y - this.height);

            distance = distance / Math.cos(degreeToRadians(this.player.angle) - rayAngleRad);

            const tileX = distance * directionCos + this.player.pos.x;
            const tileY = distance * directionSin + this.player.pos.y;

            const lightLevel = this._getLightPower(tileX, tileY);

            const textureX = Math.abs(Math.floor(tileX * texture.width)) % texture.width;
            const textureY = Math.abs(Math.floor(tileY * texture.height)) % texture.height;
            const color = applyLight(texture.colors[textureX][textureY], lightLevel);

            this.canvas.drawPixel({x, y, color});
        }
    }
}
