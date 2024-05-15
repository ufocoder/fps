import Canvas from "src/lib/Canvas/BufferCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import { degreeToRadians, distance, normalizeAngle } from "src/lib/utils";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import TextureComponent from "../components/TextureComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionMap from "../lib/PositionMap";
import QuerySystem from "../lib/QuerySystem";
import SpriteComponent from "../components/SpriteComponent";
import TextureManager from "src/managers/TextureManager";
import PolarMap, { PolarPosition } from "../lib/PolarMap";
import AnimatedSpriteComponent from "../components/AnimationComponent";

export default class RenderSystem extends System {
  requiredComponents = [CameraComponent, PositionComponent];

  protected walls: PositionMap<Entity>;

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 15;
  protected readonly rayPrecision = 128;

  protected readonly level: Level;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly textureManager: TextureManager;

  constructor(querySystem: QuerySystem, container: HTMLElement, level: Level, textureManager: TextureManager) {
    super(querySystem);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.level = level;
    this.container = container;

    this.canvas = new Canvas({
      height: this.height,
      width: this.width,
    });

    this.textureManager = textureManager;

    this.walls = new PositionMap(cols, rows);

    this.querySystem
      .query([PositionComponent, TextureComponent])
      .forEach((entity) => {
        const position = entity.getComponent(PositionComponent);

        this.walls.set(Math.floor(position.x), Math.floor(position.y), entity);
      });
  }

  start() {
    this.container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Entity[]) {
    const camera = entities.find((entity) =>
      entity.hasComponent(CameraComponent)
    );

    if (!camera) {
      return;
    }

    this.canvas.createBufferSnapshot();
    this.render(camera);
    this.canvas.commitBufferSnapshot();
  }

  destroy(): void {
    this.canvas.element.remove();
  }

  render(camera: Entity) {
    const cameraFov = camera.getComponent(CameraComponent);
    const cameraAngle = camera.getComponent(AngleComponent);
    const cameraPosition = camera.getComponent(PositionComponent);

    const polarMap = new PolarMap(
      camera,
      this.querySystem.query([PositionComponent, SpriteComponent]),
    );

    const incrementAngle = cameraFov.fov / this.width;

    let rayAngle = normalizeAngle(cameraAngle.angle - cameraFov.fov / 2);

    for (let screenX = 0; screenX < this.width; screenX++) {
      const incrementRayX =
        Math.cos(degreeToRadians(rayAngle)) / this.rayPrecision;
      const incrementRayY =
        Math.sin(degreeToRadians(rayAngle)) / this.rayPrecision;

      let rayX = cameraPosition.x;
      let rayY = cameraPosition.y;

      let distanceRay = 0;
      let wallEntity: Entity | undefined;
      let isPropogating = true;

      while (isPropogating) {
        rayX += incrementRayX;
        rayY += incrementRayY;

        if (rayX < 0 || rayX > this.walls.rows) {
          isPropogating = false;
          continue;
        }

        if (rayY < 0 || rayY > this.walls.cols) {
          isPropogating = false;
          continue;
        }

        wallEntity = this.walls.get(Math.floor(rayX), Math.floor(rayY));

        if (wallEntity) {
          isPropogating = false;
        }

        distanceRay = distance(
          cameraPosition.x,
          cameraPosition.y,
          rayX,
          rayY,
        );

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropogating = false;
        }
      }

      distanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - cameraAngle.angle));

      const wallHeight = Math.floor(this.height / 2 / distanceRay);

      if (wallEntity) {
        this._drawHorizon(screenX, wallHeight);
        this._drawFloor(screenX, wallHeight, rayAngle, camera);
        this._drawWall(screenX, rayX, rayY, wallEntity, wallHeight);
      } else {
        this._drawHorizon(screenX, 0);
        this._drawFloor(screenX, 0, rayAngle, camera);
      }

      polarMap
        .select(distanceRay, rayAngle, rayAngle + incrementAngle)
        .forEach(polarEntity => {
          this._drawSpriteLine(screenX, rayAngle, polarEntity);
        });

      rayAngle += normalizeAngle(incrementAngle);
    }
  }

  _drawHorizon(x: number, wallHeight: number) {
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

  _drawWall(
    x: number,
    rayX: number,
    rayY: number,
    wallEntity: Entity,
    wallHeight: number
  ) {
    const texture = wallEntity.getComponent(TextureComponent).texture;

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
    const animateSprite = polarEntity.entity.getComponent(AnimatedSpriteComponent).sprite;
    const staticSprite = polarEntity.entity.getComponent(SpriteComponent).sprite;
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

  _drawFloor(
    x: number,
    wallHeight: number,
    rayAngle: number,
    camera: Entity,
  ) {    
    const cameraPosition = camera.getComponent(PositionComponent);
    const cameraAngle = camera.getComponent(AngleComponent);
    const texture = this.textureManager.get('floor');

    const halfHeight = this.height / 2;
    const start = halfHeight + wallHeight + 1;

    const directionCos = Math.cos(degreeToRadians(rayAngle));
    const directionSin = Math.sin(degreeToRadians(rayAngle));

    for (let y = start; y < this.height; y++) {
      let distance = this.height / (2 * y - this.height);

      // Inverse fisheye fix
      
      distance = distance / Math.cos(degreeToRadians(cameraAngle.angle) - degreeToRadians(rayAngle));

      // Get the tile position
      let tileX = distance * directionCos;
      let tileY = distance * directionSin;
      tileX += cameraPosition.x;
      tileY += cameraPosition.y;

      // Define texture coords
      const textureX = Math.abs(Math.floor(tileX * texture.width)) % texture.width;
      const textureY = Math.abs(Math.floor(tileY * texture.height)) % texture.height;

      // Get pixel color
      const color = texture.colors[textureX][textureY];

      this.canvas.drawPixel({ x, y, color });
    }
  }
}
