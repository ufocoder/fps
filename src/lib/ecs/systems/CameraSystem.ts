import Canvas from "src/lib/Canvas/BufferCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import {
  degreeToRadians,
  radiansToDegrees,
} from "src/lib/utils";
// import BoxComponent from "src/lib/ecs/components/BoxComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import TextureComponent from "../components/TextureComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionMap from "../lib/PositionMap";
import QuerySystem from "../lib/QuerySystem";
import SpriteComponent from "../components/SpriteComponent";
import TextureManager from "src/managers/TextureManager";

export default class CameraSystem extends System {
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

    const spriteEntities: Entity[] = [];
    const incrementAngle = cameraFov.fov / this.width;

    let rayAngle = cameraAngle.angle - cameraFov.fov / 2;

    for (let x = 0; x < this.width; x++) {
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

        if (rayX < 0 || rayX > this.walls.cols) {
          isPropogating = false;
          continue;
        }

        if (rayY < 0 || rayY > this.walls.rows) {
          isPropogating = false;
          continue;
        }

        wallEntity = this.walls.get(Math.floor(rayX), Math.floor(rayY));

        if (wallEntity) {
          isPropogating = false;
        }

        distanceRay = Math.sqrt(
          Math.pow(cameraPosition.x - rayX, 2) +
            Math.pow(cameraPosition.y - rayY, 2)
        );

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropogating = false;
        }
      }

      distanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - cameraAngle.angle));

      if (wallEntity) {
        const wallHeight = Math.floor(this.height / 2 / distanceRay);

        this._drawHorizon(x, wallHeight);
        this._drawFloor(x, wallHeight, rayAngle, camera);
        this._drawWall(x, rayX, rayY, wallEntity, wallHeight);
      } else {
        this._drawHorizon(x, 0);
        this._drawFloor(x, 0, rayAngle, camera);
      }

      rayAngle += incrementAngle;
    }

    spriteEntities.forEach((sprite) => {
      this._drawSprite(camera, sprite);
    });
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

  _calculateEntityProjection(camera: Entity, entity: Entity) {
    const cameraPosition = camera.getComponent(PositionComponent);
    const cameraAngle = camera.getComponent(AngleComponent);
    const cameraFov = camera.getComponent(CameraComponent);
    const entityPosition = entity.getComponent(PositionComponent);

    const dx = entityPosition.x - cameraPosition.x;
    const dy = entityPosition.y - cameraPosition.y;

    const entityAngleRadians = Math.atan2(dx, dy);
    const entityAngle =
      radiansToDegrees(entityAngleRadians) -
      Math.floor(cameraAngle.angle - cameraFov.fov / 2);

    const x = Math.floor((entityAngle * this.width) / cameraFov.fov);
    const distance = Math.sqrt(dx ** 2 + dy ** 2);

    const height = Math.floor(this.height / 2 / distance);
    const width = Math.floor(this.width / 2 / distance);

    return {
      x,
      distance,
      height,
      width,
    };
  }

  _drawSprite(camera: Entity, sprite: Entity) {
    const spriteProjection = this._calculateEntityProjection(camera, sprite);
    const spriteTexture = sprite.getComponent(SpriteComponent).sprite;

    const wallHeight = Math.floor(this.height / spriteProjection.distance);
    const xIncrementer = spriteProjection.width / spriteTexture.width;
    const yIncrementer = spriteProjection.height / spriteTexture.height;

    let xProjection = spriteProjection.x - spriteProjection.width / 2;

    for (let spriteX = 0; spriteX < spriteTexture.width; spriteX++) {
      let yProjection =
        this.height / 2 -
        spriteProjection.height / 2 -
        (spriteProjection.height / 2 - wallHeight / 2) / 2;

      for (let spriteY = 0; spriteY < spriteTexture.height; spriteY++) {
        const color = spriteTexture.colors[spriteY][spriteX];

        if (color.a !== 0) {
          this.canvas.drawRect({
            x: xProjection,
            y: yProjection,
            width: xIncrementer,
            height: yIncrementer,
            color,
          });
        }

        yProjection += yIncrementer;
      }
      xProjection += xIncrementer;
    }
  }

}
