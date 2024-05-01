import Canvas from "src/lib/Canvas/BufferCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import { degreeToRadians } from "src/lib/utils";
// import BoxComponent from "src/lib/ecs/components/BoxComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import TextureComponent from "../components/TextureComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionMap from "../lib/PositionMap";
import QuerySystem from "../lib/QuerySystem";
import CollisionComponent from "../components/CollisionComponent";

export default class CameraSystem extends System {
  requiredComponents = [CameraComponent, PositionComponent];

  protected positionMap: PositionMap;

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 10;
  protected readonly rayPrecision = 128;

  protected readonly level: Level;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  constructor(querySystem: QuerySystem, container: HTMLElement, level: Level) {
    super(querySystem);

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.level = level;
    this.container = container;

    this.canvas = new Canvas({
      height: this.height,
      width: this.width,
    });

    this.positionMap = new PositionMap(cols, rows);

    this.querySystem
      .query([PositionComponent, CollisionComponent, TextureComponent])
      .forEach((entity) => {
        if (entity.hasComponent(CameraComponent)) {
          return;
        }

        const position = entity.getComponent(PositionComponent);

        this.positionMap.set(
          Math.floor(position.x),
          Math.floor(position.y),
          entity
        );
      });
  }

  start() {
    this.container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Entity[]) {
    this.canvas.clear();

    const camera = entities.find((entity) =>
      entity.hasComponent(CameraComponent)
    );

    if (camera) {
      this.canvas.createBufferSnapshot();
      this._rayCasting(camera);
      this.canvas.commitBufferSnapshot();
    }
  }

  destroy(): void {
    this.canvas.element.remove();
  }

  _rayCasting(camera: Entity) {
    const cameraPosition = camera.getComponent(PositionComponent);
    const cameraFov = camera.getComponent(CameraComponent);
    const cameraAngle = camera.getComponent(AngleComponent);

    const width = this.width;
    const halfHeight = this.height / 2;

    const incrementAngle = cameraFov.fov / width;
    const initialRayX = cameraPosition.x;
    const initialRayY = cameraPosition.y;

    let rayAngle = cameraAngle.angle - cameraFov.fov / 2;

    for (let rayCount = 0; rayCount < width; rayCount++) {
      const cosineIncrement =
        Math.cos(degreeToRadians(rayAngle)) / this.rayPrecision;
      const sinusIncrement =
        Math.sin(degreeToRadians(rayAngle)) / this.rayPrecision;

      let currentRayX = initialRayX;
      let currentRayY = initialRayY;
      let distanceRay = 0;
      let rayCollidedEntity: Entity | undefined;
      let isPropogating = true;

      while (isPropogating) {
        currentRayX += cosineIncrement;
        currentRayY += sinusIncrement;

        rayCollidedEntity = this.positionMap.get(
          Math.floor(currentRayX),
          Math.floor(currentRayY)
        );

        if (rayCollidedEntity) {
          isPropogating = false;
        }

        distanceRay = Math.sqrt(
          Math.pow(cameraPosition.x - currentRayX, 2) +
            Math.pow(cameraPosition.y - currentRayY, 2)
        );

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropogating = false;
        }
      }

      // Fish eye fix
      distanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - cameraAngle.angle));

      // Wall height
      const wallHeight = rayCollidedEntity
        ? Math.floor(halfHeight / distanceRay)
        : 0;

      // Draw top
      this.canvas.drawVerticalLine({
        x: rayCount,
        y1: 0,
        y2: halfHeight - wallHeight,
        color: this.level.world.colors.top,
      });

      // Draw bottom
      this.canvas.drawVerticalLine({
        x: rayCount,
        y1: halfHeight + wallHeight,
        y2: this.height,
        color: this.level.world.colors.bottom,
      });

      if (rayCollidedEntity) {
        this._drawTexture(
          rayCount,
          currentRayX,
          currentRayY,
          rayCollidedEntity.getComponent(TextureComponent).texture,
          wallHeight
        );
      }
      /*
        this._drawFloor({
            x: rayCount,
            position: cameraPosition,
            texture: this.textureManager.get('floor'),
            wallHeight,
            angle: cameraAngle.angle,
            rayAngle,
        });
  */

      rayAngle += incrementAngle;
    }
  }

  _drawTexture(
    x: number,
    rayX: number,
    rayY: number,
    texture: Texture,
    wallHeight: number
  ) {
    const texturePositionX = Math.floor(
      (texture.width * (rayX + rayY)) % texture.width
    );
    const yIncrementer = (wallHeight * 2) / texture.height;
    let y = this.height / 2 - wallHeight;

    for (let i = 0; i < texture.height; i++) {
      const y1 = y;
      const y2 = y + (yIncrementer + 0.5) + 1;

      y += yIncrementer;

      if (y1 < 0 && y2 < 0 || y1 > this.height && y2 > this.height) {
        continue;
      }

      this.canvas.drawVerticalLine({
        x: x,
        y1,
        y2,
        color: texture.colors[i][texturePositionX],
      });
    }
  }

  _drawFloor({
    x,
    texture,
    position,
    wallHeight,
    angle,
    rayAngle,
  }: {
    x: number;
    texture: Texture;
    position: PositionComponent;
    wallHeight: number;
    angle: number;
    rayAngle: number;
  }) {
    const halfHeight = this.height / 2;

    const start = halfHeight + wallHeight + 1;
    const directionCos = Math.cos(degreeToRadians(rayAngle));
    const directionSin = Math.sin(degreeToRadians(rayAngle));

    for (let y = start; y < this.height; y++) {
      let distance = this.height / (2 * y - this.height);

      // Inverse fisheye fix
      distance =
        distance / Math.cos(degreeToRadians(angle) - degreeToRadians(rayAngle));

      // Get the tile position
      let tileX = distance * directionCos;
      let tileY = distance * directionSin;
      tileX += position.x;
      tileY += position.y;

      // Define texture coords
      const textureX =
        Math.abs(Math.floor(tileX * texture.width)) % texture.width;
      const textureY =
        Math.abs(Math.floor(tileY * texture.height)) % texture.height;

      // Get pixel color
      const color = texture.colors[textureX][textureY];
      this.canvas.drawPixel({ x, y, color });
    }
  }
}
