import MapTextureSystem from "../MapTextureSystem";
import { PolarPosition } from "src/lib/ecs/lib/PolarMap";
import ECS from "src/lib/ecs";
import System from "src/lib/ecs/System";
import LightSystem from "src/lib/ecs/systems/LightSystem";
import MapPolarSystem from "src/lib/ecs/systems/MapPolarSystem.ts";
import { ComponentContainer } from "src/lib/ecs/Component";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SpriteComponent from "src/lib/ecs/components/SpriteComponent";
import HighlightComponent from "src/lib/ecs/components/HighlightComponent.ts";
import Canvas from "src/lib/Canvas/WebglCanvas";
import TextureManager from "src/managers/TextureManager";
import {
  EntityRender,
  RenderLineInfo,
} from "src/lib/ecs/systems/RenderSystem/EntityRenders/IEntityRender.ts";
import { WallRender } from "./EntityRenders/WallRender.ts";
import { DoorRender } from "./EntityRenders/DoorRender.ts";

import { degreeToRadians, normalizeAngle } from "src/lib/utils/angle";
import { overlayColor, applyBrightness } from "src/lib/utils/color.ts";

export default class RenderSystem extends System {
  public readonly componentsRequired = new Set([PositionComponent]);
  public readonly mapEntityRenders: EntityRender[] = [];

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 20;
  protected player = {
    pos: { x: 0, y: 0 },
    angle: 0,
  };

  protected readonly level: Level;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly textureManager: TextureManager;

  private lightSystem: LightSystem;

  constructor(
    ecs: ECS,
    container: HTMLElement,
    level: Level,
    textureManager: TextureManager,
  ) {
    super(ecs);

    this.container = container;
    this.level = level;
    this.textureManager = textureManager;

    this.canvas = new Canvas({
      id: "camera",
      height: this.height,
      width: this.width,
    });

    this.mapEntityRenders = [new DoorRender(), new WallRender()];
    this.lightSystem = this.ecs.getSystem(LightSystem)!;
  }

  start() {
    this.container.appendChild(this.canvas.element);
  }

  update() {
    this.canvas.clear();

    const [player] = this.ecs.query([PlayerComponent]);
    const playerContainer = this.ecs.getComponents(player);

    if (!playerContainer) {
      return;
    }

    const posCmp = playerContainer.get(PositionComponent);
    const angleCmp = playerContainer.get(AngleComponent);
    this.player = {
      pos: posCmp,
      angle: angleCmp.angle,
    };

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
    const polarMap = this.ecs.getSystem(MapPolarSystem)!.polarMap;

    let rayAngle = normalizeAngle(this.player.angle - playerFov.fov / 2);

    for (let screenX = 0; screenX < this.width; screenX++) {
      const rayRad = degreeToRadians(rayAngle);
      const fishEyeFixCoef = Math.cos(
        degreeToRadians(rayAngle - this.player.angle),
      );

      const rayDirX = Math.cos(rayRad);
      const rayDirY = Math.sin(rayRad);

      let mapX = Math.floor(this.player.pos.x);
      let mapY = Math.floor(this.player.pos.y);

      const deltaDistX = Math.abs(1 / rayDirX);
      const deltaDistY = Math.abs(1 / rayDirY);

      let stepX, stepY;
      let sideDistX, sideDistY;

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

      let side = 0; // 0 for vertical, 1 for horizontal

      let mapEntity: ComponentContainer | undefined;
      let renderer: EntityRender | undefined;
      let renderObjectInfo: RenderLineInfo | undefined;

      // Perform DDA
      while (!renderObjectInfo) {
        if (sideDistX < sideDistY) {
          sideDistX += deltaDistX;
          mapX += stepX;
          side = 0;
        } else {
          sideDistY += deltaDistY;
          mapY += stepY;
          side = 1;
        }

        mapEntity = textureMap.get(mapX, mapY);
        if (mapEntity) {
          renderer = this.mapEntityRenders.find((render) =>
            render.canRender(mapEntity!),
          );
          renderObjectInfo = renderer?.render(
            mapEntity,
            this.height,
            rayAngle,
            side,
            sideDistX,
            sideDistY,
            deltaDistX,
            deltaDistY,
            mapX,
            mapY,
            this.player.pos,
            stepX,
            stepY,
            rayDirX,
            rayDirY,
            fishEyeFixCoef,
          );
        }
      }

      if (mapEntity && renderer) {
        this.drawTextureLine(screenX, renderObjectInfo);
        this._drawFloorLine(screenX, renderObjectInfo.entityHeight, rayAngle);
      } else {
        this._drawFloorLine(screenX, 0, rayAngle);
      }

      rayAngle += normalizeAngle(playerFov.fov / this.width);

      const incrementAngle = playerFov.fov / this.width;

      const polarEntities = polarMap.select(
        renderObjectInfo?.distance ?? this.rayMaxDistanceRay,
        rayAngle,
        rayAngle + incrementAngle,
      );
      for (const polarEntity of polarEntities) {
        this._drawSpriteLine(screenX, rayAngle, polarEntity);
      }
    }
  }
  drawTextureLine(
    screenX: number,
    { entityHeight, texture, texturePositionX, rayX, rayY }: RenderLineInfo,
  ) {
    const yIncrementer = (entityHeight * 2) / texture.height;
    let y = this.height / 2 - entityHeight;

    const lightLevel = this.lightSystem.getLightingLevelForPoint(rayX, rayY);

    for (let i = 0; i < texture.height; i++) {
      if (y > -yIncrementer && y < this.height) {
        this.canvas.drawVerticalLine({
          x: screenX,
          y1: y,
          y2: Math.floor(y + yIncrementer),
          color: applyBrightness(
            texture.colors[i][texturePositionX],
            lightLevel,
          ),
        });
      }
      y += yIncrementer;
    }
  }

  // @TODO: extract to entity renderers ?
  _drawSpriteLine(
    screenX: number,
    rayAngle: number,
    polarEntity: PolarPosition,
  ) {
    const container = polarEntity.container;
    const animateSprite = container.get(AnimatedSpriteComponent)?.sprite;
    const staticSprite = container.get(SpriteComponent)?.sprite;
    const highlight = container.get(HighlightComponent);
    const spritePosition = container.get(PositionComponent);
    const sprite = animateSprite || staticSprite;
    if (!sprite || !spritePosition) return;

    const {
      width: spriteWidth,
      height: spriteHeight,
      colors: spriteColors,
    } = sprite;

    const projectionHeight = (this.height / (2 * polarEntity.distance)) | 0;
    const yIncrementer = (projectionHeight * 2) / spriteHeight;
    let y = (this.height / 2 - projectionHeight) | 0;

    const a1 = normalizeAngle(rayAngle - polarEntity.angleFrom);
    const a2 = normalizeAngle(polarEntity.angleTo - polarEntity.angleFrom);
    const xTexture = ((a1 / a2) * spriteWidth) | 0;

    const lightLevel = this.lightSystem.getLightingLevelForPoint(
      spritePosition.x,
      spritePosition.y,
    );

    let highlightPercent = 0;
    if (highlight) {
      const timeLeft = highlight.startedAt + highlight.duration - Date.now();
      highlightPercent = Math.max(0, timeLeft / highlight.duration);
    }

    for (let i = 0; i < spriteHeight; i++) {
      const spriteColor = spriteColors[i][xTexture];

      const color = highlight
        ? overlayColor(spriteColor, highlight.color, highlightPercent)
        : spriteColor;

      if (y > -yIncrementer && y < this.height) {
        this.canvas.drawVerticalLine({
          x: screenX,
          y1: y,
          y2: (y + yIncrementer) | 0,
          color: applyBrightness(color, lightLevel),
        });
      }

      y += yIncrementer;
    }
  }

  _drawFloorLine(x: number, wallHeight: number, rayAngle: number) {
    const texture = this.textureManager.get("floor");
    const { width: textureWidth, height: textureHeight, colors } = texture;

    const halfHeight = this.height / 2;
    const start = halfHeight + wallHeight + 1;

    const rayAngleRad = degreeToRadians(rayAngle);
    const directionCos = Math.cos(rayAngleRad);
    const directionSin = Math.sin(rayAngleRad);

    const angleDiffCos =
      1 / Math.cos(degreeToRadians(this.player.angle) - rayAngleRad);

    for (let y = start; y < this.height; y++) {
      const yDiff = 2 * y - this.height;
      const distance = (this.height / yDiff) * angleDiffCos;

      const tileX = distance * directionCos + this.player.pos.x;
      const tileY = distance * directionSin + this.player.pos.y;

      const lightLevel = this.lightSystem.getLightingLevelForPoint(
        tileX,
        tileY,
      );

      // Faster texture coordinates calculation
      const textureX = ((tileX * textureWidth) | 0) % textureWidth;
      const textureY = ((tileY * textureHeight) | 0) % textureHeight;

      // Access color and apply brightness
      const color = applyBrightness(colors[textureX][textureY], lightLevel);

      // Draw the pixel
      this.canvas.drawPixel({ x, y, color });
    }
  }
}
