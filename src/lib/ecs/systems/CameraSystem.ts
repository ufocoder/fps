import Canvas from "src/lib/Canvas/BufferCanvas";
import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import { calculateAngle, degreeToRadians, radiansToDegrees } from "src/lib/utils";
// import BoxComponent from "src/lib/ecs/components/BoxComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import TextureComponent from "../components/TextureComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionMap from "../lib/PositionMap";
import QuerySystem from "../lib/QuerySystem";
import SpriteComponent from "../components/SpriteComponent";
import BoxComponent from "../components/BoxComponent";

export default class CameraSystem extends System {
  requiredComponents = [CameraComponent, PositionComponent];

  protected textureMap: PositionMap;
  protected spriteMap: PositionMap;

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 15;
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

    this.textureMap = new PositionMap(cols, rows);
    this.spriteMap = new PositionMap(cols, rows);

    this.querySystem
      .query([PositionComponent, TextureComponent])
      .forEach((entity) => {
        const position = entity.getComponent(PositionComponent);

        this.textureMap.set(
          Math.floor(position.x),
          Math.floor(position.y),
          entity
        );
      });

    this.querySystem
      .query([PositionComponent, SpriteComponent])
      .forEach((entity) => {
        const position = entity.getComponent(PositionComponent);

        this.spriteMap.set(
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

    const initialRayX = cameraPosition.x;
    const initialRayY = cameraPosition.y;
    const incrementAngle = cameraFov.fov / width;

    let rayAngle = cameraAngle.angle - cameraFov.fov / 2;
    const spriteEntities: Entity[] = [];

    for (let rayCount = 0; rayCount < width; rayCount++) {

      const rayCollidedSpriteEntities: Set<Entity> = new Set();
      const incrementRayX = Math.cos(degreeToRadians(rayAngle)) / this.rayPrecision;
      const incrementRayY = Math.sin(degreeToRadians(rayAngle)) / this.rayPrecision;

      let currentRayX = initialRayX;
      let currentRayY = initialRayY;
      let distanceRay = 0;
      let rayCollidedTextureEntity: Entity | undefined;
      let rayCollidedSpriteEntity: Entity | undefined;
      let isPropogating = true;

      while (isPropogating) {
        currentRayX += incrementRayX;
        currentRayY += incrementRayY;

        const x = Math.floor(currentRayX);
        const y = Math.floor(currentRayY);

        rayCollidedTextureEntity = this.textureMap.get(x, y);
        rayCollidedSpriteEntity = this.spriteMap.get(x, y);

        if (rayCollidedTextureEntity) {
          isPropogating = false;
        }

        distanceRay = Math.sqrt(
          Math.pow(cameraPosition.x - currentRayX, 2) +
          Math.pow(cameraPosition.y - currentRayY, 2)
        );

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropogating = false;
        }

        if (isPropogating && rayCollidedSpriteEntity && !rayCollidedSpriteEntities.has(rayCollidedSpriteEntity)) {
          rayCollidedSpriteEntities.add(rayCollidedSpriteEntity);
        }
      }

      rayCollidedSpriteEntities.forEach(entity => {
        const entityPosition = entity.getComponent(PositionComponent);
        const entityAngle = calculateAngle(cameraPosition.x, cameraPosition.y, entityPosition.x, entityPosition.y);

        if (entityAngle >= rayAngle && entityAngle <= rayAngle + incrementAngle) {
          spriteEntities.unshift(entity);
        }
      })

      // Fish eye fix
      distanceRay = distanceRay * Math.cos(degreeToRadians(rayAngle - cameraAngle.angle));

      // Wall height
      const wallHeight = rayCollidedTextureEntity
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

      if (rayCollidedTextureEntity) {
        this._drawTexture(
          rayCount,
          currentRayX,
          currentRayY,
          rayCollidedTextureEntity,
          wallHeight
        );
      }

      rayAngle += incrementAngle;
    }

    spriteEntities.forEach(sprite => {
      this._drawSprite(camera, sprite);
    })

  }

  _drawTexture(
    x: number,
    rayX: number,
    rayY: number,
    entity: Entity,
    wallHeight: number
  ) {

    const texture = entity.getComponent(TextureComponent).texture;
    const box = entity.getComponent(BoxComponent);

    const texturePositionX = Math.floor(
      (texture.width * (rayX + rayY)) % texture.width
    );
    const yIncrementer = (wallHeight * 2) / texture.height;
    let y = this.height / 2 - wallHeight;

    for (let i = 0; i < texture.height; i++) {
      const y1 = y;
      const y2 = y + (yIncrementer + box.size / 2) + 1;

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
 
  _calculateSpriteProjection(
    camera: Entity,
    sprite: Entity
  ) {
    const cameraPosition = camera.getComponent(PositionComponent);
    const cameraAngle = camera.getComponent(AngleComponent);
    const cameraFov = camera.getComponent(CameraComponent);
    const spritePosition = sprite.getComponent(PositionComponent);

    // Get X and Y coords in relation of the player coords
    const spriteXRelative = spritePosition.x - cameraPosition.x; 
    const spriteYRelative = spritePosition.y - cameraPosition.y;

    // Get angle of the sprite in relation of the player angle
    const spriteAngleRadians = Math.atan2(spriteYRelative, spriteXRelative);
    const spriteAngle = radiansToDegrees(spriteAngleRadians) - Math.floor(cameraAngle.angle - cameraFov.fov / 2);

    // Three rule to discover the x position of the script
    const spriteX = Math.floor(spriteAngle * this.width / cameraFov.fov);
    
    // Get the distance of the sprite (Pythagoras theorem)
    const distance = Math.sqrt(Math.pow(cameraPosition.x - spritePosition.x, 2) + Math.pow(cameraPosition.y - spritePosition.y, 2));

    // Calc sprite width and height
    const spriteHeight = Math.floor(this.height / 2 / distance);
    const spriteWidth = Math.floor(this.width / 2 / distance);

    return {
      distance,
      x: spriteX,
      height: spriteHeight,
      width: spriteWidth,
    };
  }

  _drawSprite(
    camera: Entity,
    sprite: Entity
  ) {
    const spriteProjection = this._calculateSpriteProjection(camera, sprite);
    const spriteTexture = sprite.getComponent(SpriteComponent).sprite;

    const wallHeight = Math.floor(this.height / spriteProjection.distance);
    const xIncrementer = (spriteProjection.width) / spriteTexture.width;
    const yIncrementer = (spriteProjection.height) / spriteTexture.height;

    let xProjection = spriteProjection.x - spriteProjection.width / 2;

    for(let spriteX = 0 ; spriteX < spriteTexture.width; spriteX++) {
      let yProjection = this.height / 2 - spriteProjection.height / 2 - (spriteProjection.height /2 - wallHeight / 2) / 2;

      for(let spriteY = 0; spriteY < spriteTexture.height; spriteY++) {
          const color = spriteTexture.colors[spriteY][spriteX];

          if (color.a !== 0) {
            this.canvas.drawRect({
              x: xProjection, 
              y: yProjection, 
              width: xIncrementer,
              height: yIncrementer,
              color
            });
          }

          yProjection += yIncrementer;
      }
      xProjection += xIncrementer;
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
