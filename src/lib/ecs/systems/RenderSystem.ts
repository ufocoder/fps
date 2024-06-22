
import MapTextureSystem from "./MapTextureSystem";
import MapPolarSystem from "./MapPolarSystem";
import { PolarPosition } from "src/lib/ecs/lib/PolarMap";
import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import { ComponentContainer } from "src/lib/ecs/Component";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SpriteComponent from "src/lib/ecs/components/SpriteComponent";
import TextureComponent from "src/lib/ecs/components/TextureComponent";
import Canvas from "src/lib/Canvas/BufferCanvas";
import TextureManager from "src/managers/TextureManager";
import { degreeToRadians, distance, normalizeAngle, Vec2D } from "src/lib/utils";
import DoorComponent from "src/lib/ecs/components/DoorComponent.ts";

export default class RenderSystem extends System {
  public readonly componentsRequired = new Set([PositionComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 20;
  protected readonly rayPrecision = 128;
  protected readonly doorWidth = 0.05;

  protected readonly level: Level;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly textureManager: TextureManager;

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

      let wallTextureOffset = Vec2D.zeros();

      let distanceRay = 0;
      let wallEntity: ComponentContainer | undefined;
      let isPropagating = true;
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

        wallEntity = textureMap.get(Math.floor(rayX), Math.floor(rayY));
        const doorCmp = wallEntity?.get(DoorComponent);

        if (wallEntity) {
          if (doorCmp) {
            const position = wallEntity.get(PositionComponent);
            if (doorCmp.isVertical) {
              isPropagating = rayX < Math.floor(rayX) + 0.5 - this.doorWidth / 2 || rayX > Math.floor(rayX) + 0.5 + this.doorWidth / 2;
            } else {
              isPropagating = rayY < Math.floor(rayY) + 0.5 - this.doorWidth / 2 || rayY > Math.floor(rayY) + 0.5 + this.doorWidth / 2;
            }

            if (!isPropagating) {
              wallTextureOffset = doorCmp.isVertical
                  ? Vec2D.from(rayX - position.x,Math.floor(rayY) - position.y)
                  : Vec2D.from(Math.floor(rayX) - position.x, rayY - position.y);
            }
          } else {
           isPropagating = false;
          }
        }

        distanceRay = distance(
          playerPosition.x,
          playerPosition.y,
          rayX,
          rayY,
        );

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropagating = false;
        }
      }

      const normalizedDistanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - playerAngle.angle));

      const wallHeight = Math.floor(this.height / 2 / normalizedDistanceRay);

      if (wallEntity) {
        this._drawHorizonLine(screenX, wallHeight);
        this._drawWallLine(screenX, rayX + wallTextureOffset.x, rayY + wallTextureOffset.y, wallEntity, wallHeight);
        this._drawFloorLine(screenX, wallHeight, rayAngle, player);
      } else {
        this._drawHorizonLine(screenX, 0);
        this._drawFloorLine(screenX, 0, rayAngle, player);
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

  _drawWallLine(
    x: number,
    rayX: number,
    rayY: number,
    wallComponents: ComponentContainer,
    wallHeight: number
  ) {
    const texture = wallComponents.get(TextureComponent).texture;

    const texturePositionX = Math.floor(
      (texture.width * (rayX + rayY)) % texture.width
    );

    const yIncrementer = (wallHeight * 2) / texture.height;
    let y = this.height / 2 - wallHeight;

    for (let i = 0; i < texture.height; i++) {
      if (y > -yIncrementer && y < this.height) {
        this.canvas.drawVerticalLine({
          x,
          y1: y,
          y2: Math.floor(y + yIncrementer),
          color: texture.colors[i][texturePositionX],
        });
      }
      y += yIncrementer;
    }
  }

  _drawSpriteLine(screenX: number, rayAngle: number, polarEntity: PolarPosition){
    const animateSprite = polarEntity.container.get(AnimatedSpriteComponent)?.sprite;
    const staticSprite = polarEntity.container.get(SpriteComponent)?.sprite;
    const projectionHeight = Math.floor(this.height / 2 / polarEntity.distance);
    const sprite = animateSprite || staticSprite;

    const a1 = normalizeAngle(rayAngle - polarEntity.angleFrom);
    const a2 = normalizeAngle(polarEntity.angleTo - polarEntity.angleFrom);
    const xTexture = Math.floor(a1 / a2 * sprite.width)

    const yIncrementer = (projectionHeight * 2) / sprite.height;

    let y = this.height / 2 - projectionHeight;

    for (let i = 0; i < sprite.height; i++) {
      if (y > -yIncrementer && y < this.height) {
        this.canvas.drawVerticalLine({
          x: screenX,
          y1: y,
          y2: Math.floor(y + yIncrementer),
          color: sprite.colors[i][xTexture],
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
    const texture = this.textureManager.get('floor');

    const halfHeight = this.height / 2;
    const start = halfHeight + wallHeight + 1;

    const directionCos = Math.cos(degreeToRadians(rayAngle));
    const directionSin = Math.sin(degreeToRadians(rayAngle));

    for (let y = start; y < this.height; y++) {
      let distance = this.height / (2 * y - this.height);

      distance = distance / Math.cos(degreeToRadians(playerAngle.angle) - degreeToRadians(rayAngle));

      let tileX = distance * directionCos;
      let tileY = distance * directionSin;
      tileX += playerPosition.x;
      tileY += playerPosition.y;

      const textureX = Math.abs(Math.floor(tileX * texture.width)) % texture.width;
      const textureY = Math.abs(Math.floor(tileY * texture.height)) % texture.height;
      const color = texture.colors[textureX][textureY];

      this.canvas.drawPixel({ x, y, color });
    }
  }
}
