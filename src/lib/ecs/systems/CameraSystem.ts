import Canvas from "src/lib/Canvas/BufferCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import { degreeToRadians } from "src/lib/utils";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import MinimapComponent from "src/lib/ecs/components/ColorComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import FieldOfVisionComponent from "src/lib/ecs/components/FovComponent";
import TextureManager from "src/managers/TextureManager";

export default class CameraSystem implements System {
  components = [PositionComponent, BoxComponent, MinimapComponent];

  readonly width: number = 640;
  readonly height: number = 480;
  readonly level: Level;
  readonly canvas: Canvas;
  readonly textureManager: TextureManager;

  
  constructor(container: HTMLElement, level: Level, textureManager: TextureManager) {
    this.level = level;
    this.textureManager = textureManager;

    this.canvas = new Canvas({
      height: this.height,
      width: this.width,
    });

    container.appendChild(this.canvas.element);
  }

  update(_: number, entities: Entity[]) {
    this.canvas.clear();

    console.log('CameraSystem:update');

    const camera = entities.find((entity) =>
      entity.hasComponent(FieldOfVisionComponent)
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

  _isWall(x: number, y: number) {
    return this.level.map[Math.floor(y)]
      ? this.level.map[Math.floor(y)][Math.floor(x)] > 0
      : false;
  }

  _rayCasting(camera: Entity, ) {
    const cameraPosition = camera.getComponent(PositionComponent);
    const cameraFov = camera.getComponent(FieldOfVisionComponent);
    const cameraAngle = camera.getComponent(AngleComponent);

    const height = this.height;
    const width = this.width;
    const halfHeight = this.height / 2;

    const incrementAngle = cameraFov.fov / width;
    const maxDistanceRay = 50;
    const precisionRay = 100;

    let rayAngle = cameraAngle.angle - cameraFov.fov / 2;

    for (let rayCount = 0; rayCount < width; rayCount++) {
      const initialRayX = cameraPosition.x;
      const initialRayY = cameraPosition.y;

      const cosineIncrement = Math.cos(degreeToRadians(rayAngle)) / precisionRay;
      const sinusIncrement = Math.sin(degreeToRadians(rayAngle)) / precisionRay;

      let currentRayX = initialRayX;
      let currentRayY = initialRayY;
      let distanceRay = 0;

      let isFacedWithWall = false;
      let isPropogating = true;

      while (isPropogating) {
        currentRayX += cosineIncrement;
        currentRayY += sinusIncrement;

        if (this._isWall(currentRayX, currentRayY)) {
          isFacedWithWall = true;
          isPropogating = false;
        }

        distanceRay = Math.sqrt(
          Math.pow(cameraPosition.x - currentRayX, 2)
          + Math.pow(cameraPosition.y - currentRayY, 2)
        );

        if (distanceRay >= maxDistanceRay) {
          isPropogating = false;
        }
      }

      // Fish eye fix
      distanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - cameraAngle.angle));

      // Wall height
      const wallHeight = isFacedWithWall
        ? Math.floor(halfHeight / distanceRay)
        : 0;

      // Draw
      this.canvas.drawVerticalLine({
        x: rayCount,
        y1: 0,
        y2: halfHeight - wallHeight,
        color: this.level.world.colors.top,
      });


        if (isFacedWithWall) {
            const texture = this.textureManager.get('wall-1a');
            this._drawTexture(
                rayCount,
                currentRayX,
                currentRayY,
                texture,
                wallHeight
            );
        }

      this.canvas.drawVerticalLine({
        x: rayCount,
        y1: halfHeight + wallHeight,
        y2: height,
        color: this.level.world.colors.bottom,
      });

      rayAngle += incrementAngle;
    }
  }

  _drawTexture(
    x: number,
    rayX: number,
    rayY: number,
    texture: Texture,
    wallHeight: number,
  ) {
    const texturePositionX = Math.floor(
      (texture.width * (rayX + rayY)) % texture.width
    );
    const yIncrementer = (wallHeight * 2) / texture.height;
    let y = this.height / 2 - wallHeight;

    for (let i = 0; i < texture.height; i++) {
      this.canvas.drawVerticalLine({
        x: x,
        y1: y,
        y2: y + (yIncrementer + 0.5) + 1,
        color: texture.colors[i][texturePositionX],
      });
      y += yIncrementer;
    }
  }
}
