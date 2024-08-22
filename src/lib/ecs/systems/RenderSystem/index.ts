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
import HighlightComponent from "src/lib/ecs/components/HighlightComponent.ts";
import EntityRender from "src/lib/ecs/systems/RenderSystem/EntityRenders/BaseRender.ts";
import Canvas from "src/lib/Canvas/BufferCanvas";
import TextureManager from "src/managers/TextureManager";
import { degreeToRadians, distance, normalizeAngle } from "src/lib/utils";
import WallRender from "./EntityRenders/WallRender.ts";
import DoorRender from "./EntityRenders/DoorRender.ts";

function overlayColor(baseColor: Color, overlayColor: Color, coverageRatio: number): Color {
  if (baseColor.a === 0) {
    return baseColor;
  }

  const invCoverageRatio = 1 - coverageRatio;

  const effectiveAlpha = overlayColor.a * coverageRatio;

  const r = baseColor.r * invCoverageRatio + overlayColor.r * effectiveAlpha;
  const g = baseColor.g * invCoverageRatio + overlayColor.g * effectiveAlpha;
  const b = baseColor.b * invCoverageRatio + overlayColor.b * effectiveAlpha;
  const a =  baseColor.a + overlayColor.a * coverageRatio * invCoverageRatio;

  return { r, g, b, a };
}

export default class RenderSystem extends System {
  public readonly componentsRequired = new Set([PositionComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 20;
  protected readonly rayPrecision = 128;

  protected readonly level: Level;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly textureManager: TextureManager;

  private mapEntityRenders: EntityRender[] = [];

  constructor(
    ecs: ECS,
    container: HTMLElement,
    level: Level,
    textureManager: TextureManager,
  ) {
    super(ecs);

    this.level = level;
    this.container = container;

    this.canvas = new Canvas({
      id: "camera",
      height: this.height,
      width: this.width,
    });

    this.textureManager = textureManager;
  }

  start() {
    this.container.appendChild(this.canvas.element);

    this.mapEntityRenders = [
      new DoorRender(this.height, this.canvas),
      new WallRender(this.height, this.canvas),
    ];
  }

  update() {
    const [player] = this.ecs.query([PlayerComponent]);
    const playerContainer = this.ecs.getComponents(player);

    if (!playerContainer) {
      return;
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
    const playerAngle = player.get(AngleComponent);
    const playerPosition = player.get(PositionComponent);
    const textureMap = this.ecs.getSystem(MapTextureSystem)!.textureMap;

    let rayAngle = normalizeAngle(playerAngle.angle - playerFov.fov / 2);

    for (let screenX = 0; screenX < this.width; screenX++) {
      const incrementRayX =
        Math.cos(degreeToRadians(rayAngle)) / this.rayPrecision;
      const incrementRayY =
        Math.sin(degreeToRadians(rayAngle)) / this.rayPrecision;

      let rayX = playerPosition.x;
      let rayY = playerPosition.y;

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

        // @TODO: refactor
        if (mapEntity !== undefined) {
          renderer = this.mapEntityRenders.find((render) =>
            render.canRender(mapEntity!),
          );
          isPropagating = !renderer?.isRayHit(mapEntity!, rayX, rayY);
        }

        distanceRay = distance(playerPosition.x, playerPosition.y, rayX, rayY);

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropagating = false;
        }
      }

      const normalizedDistanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - playerAngle.angle));

      const wallHeight = Math.floor(this.height / 2 / normalizedDistanceRay);

      if (mapEntity && renderer) {
        this._drawHorizonLine(screenX, wallHeight);
        renderer.render(screenX, mapEntity, rayX, rayY, wallHeight);
        this._drawFloorLine(screenX, wallHeight, rayAngle, player);
      } else {
        this._drawHorizonLine(screenX, 0);
        this._drawFloorLine(screenX, 0, rayAngle, player);
      }

      const incrementAngle = playerFov.fov / this.width;
      const polarMap = this.ecs.getSystem(MapPolarSystem)!.polarMap;

      polarMap
        .select(distanceRay, rayAngle, rayAngle + incrementAngle)
        .forEach((polarEntity) => {
          this._drawSpriteLine(screenX, rayAngle, polarEntity);
        });

      rayAngle += normalizeAngle(incrementAngle);
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

  // @TODO: extract to entity renderers ?
  _drawSpriteLine(
    screenX: number,
    rayAngle: number,
    polarEntity: PolarPosition,
  ) {
    const animateSprite = polarEntity.container.get(
      AnimatedSpriteComponent,
    )?.sprite;
    const staticSprite = polarEntity.container.get(SpriteComponent)?.sprite;
    const highlight = polarEntity.container.get(HighlightComponent);
    const projectionHeight = Math.floor(this.height / 2 / polarEntity.distance);
    const sprite = animateSprite || staticSprite;

    const a1 = normalizeAngle(rayAngle - polarEntity.angleFrom);
    const a2 = normalizeAngle(polarEntity.angleTo - polarEntity.angleFrom);
    const xTexture = Math.floor((a1 / a2) * sprite.width);

    const yIncrementer = (projectionHeight * 2) / sprite.height;

    let y = this.height / 2 - projectionHeight;

    for (let i = 0; i < sprite.height; i++) {
      const spriteColor = sprite.colors[i][xTexture];
      let color = spriteColor

      if (highlight) {
        const percent = Math.max(0, (highlight.startedAt +  highlight.duration - Date.now()) / highlight.duration);

        color = highlight ? overlayColor(spriteColor, highlight.color, percent) : spriteColor;
      }

      if (y > -yIncrementer && y < this.height) {
        this.canvas.drawVerticalLine({
          x: screenX,
          y1: y,
          y2: Math.floor(y + yIncrementer),
          color,
        });
      }
      y += yIncrementer;
    }
  }

  _drawFloorLine(
    x: number,
    wallHeight: number,
    rayAngle: number,
    player: ComponentContainer,
  ) {
    const playerPosition = player.get(PositionComponent);
    const playerAngle = player.get(AngleComponent);
    const texture = this.textureManager.get("floor");

    const halfHeight = this.height / 2;
    const start = halfHeight + wallHeight + 1;

    const directionCos = Math.cos(degreeToRadians(rayAngle));
    const directionSin = Math.sin(degreeToRadians(rayAngle));

    for (let y = start; y < this.height; y++) {
      let distance = this.height / (2 * y - this.height);

      distance =
        distance /
        Math.cos(
          degreeToRadians(playerAngle.angle) - degreeToRadians(rayAngle),
        );

      let tileX = distance * directionCos;
      let tileY = distance * directionSin;
      tileX += playerPosition.x;
      tileY += playerPosition.y;

      const textureX =
        Math.abs(Math.floor(tileX * texture.width)) % texture.width;
      const textureY =
        Math.abs(Math.floor(tileY * texture.height)) % texture.height;
      const color = texture.colors[textureX][textureY];

      this.canvas.drawPixel({ x, y, color });
    }
  }
}
