import Canvas from "src/lib/Canvas/BufferCanvas";
import System from "src/lib/ecs/System";
import { degreeToRadians, distance, normalizeAngle } from "src/lib/utils";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import TextureComponent from "../components/TextureComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionMap from "../lib/PositionMap";
import SpriteComponent from "../components/SpriteComponent";
import TextureManager from "src/managers/TextureManager";
import PolarMap, { PolarPosition } from "../lib/PolarMap";
import AnimatedSpriteComponent from "../components/AnimationComponent";
import { ComponentContainer } from "../Component";
import ECS from "..";

export default class RenderSystem extends System {
  componentsRequired = new Set([PositionComponent]);

  protected textureMap: PositionMap<ComponentContainer>;

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly rayMaxDistanceRay = 20;
  protected readonly rayPrecision = 128;

  protected readonly level: Level;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;
  protected readonly textureManager: TextureManager;

  constructor(ecs: ECS, container: HTMLElement, level: Level, textureManager: TextureManager) {
    super(ecs);
    const cols = level.map[0].length;
    const rows = level.map.length;

    this.level = level;
    this.container = container;

    this.canvas = new Canvas({
      id: 'camera',
      height: this.height,
      width: this.width,
    });

    this.textureManager = textureManager;
    this.textureMap = new PositionMap(cols, rows);
  }

  start() {
    const textures = this.ecs.query([PositionComponent, TextureComponent]);
    
    textures.forEach((container) => {
        const { x, y } = container.get(PositionComponent);
        this.textureMap.set(x, y, container);
      });
    console.log()

    this.container.appendChild(this.canvas.element);
  }

  update() {
    const [player] = this.ecs.query([CameraComponent]);

    if (!player) {
      return;
    }

    const sprites = this.ecs.query([PositionComponent, SpriteComponent]);
    const polarMap = new PolarMap(player, sprites);

    this.canvas.createBufferSnapshot();
    this.render(player, polarMap);
    this.canvas.commitBufferSnapshot();
  }

  destroy(): void {
    this.canvas.element.remove();
  }

  render(player: ComponentContainer, polarMap: PolarMap) {
    const playerFov = player.get(CameraComponent);
    const playerAngle = player.get(AngleComponent);
    const playerPosition = player.get(PositionComponent);

    const incrementAngle = playerFov.fov / this.width;

    let rayAngle = normalizeAngle(playerAngle.angle - playerFov.fov / 2);
    
    for (let screenX = 0; screenX < this.width; screenX++) {

      const incrementRayX =
        Math.cos(degreeToRadians(rayAngle)) / this.rayPrecision;
      const incrementRayY =
        Math.sin(degreeToRadians(rayAngle)) / this.rayPrecision;

      let rayX = playerPosition.x;
      let rayY = playerPosition.y;

      let distanceRay = 0;
      let wallEntity: ComponentContainer | undefined;
      let isPropogating = true;
      while (isPropogating) {
        rayX += incrementRayX;
        rayY += incrementRayY;

        if (rayX < 0 || rayX > this.textureMap.cols) {
          isPropogating = false;
          continue;
        }

        if (rayY < 0 || rayY > this.textureMap.rows) {
          isPropogating = false;
          continue;
        }

        wallEntity = this.textureMap.get(Math.floor(rayX), Math.floor(rayY));

        if (wallEntity) {
          isPropogating = false;
        }

        distanceRay = distance(
          playerPosition.x,
          playerPosition.y,
          rayX,
          rayY,
        );

        if (distanceRay >= this.rayMaxDistanceRay) {
          isPropogating = false;
        }
      }

      distanceRay =
        distanceRay * Math.cos(degreeToRadians(rayAngle - playerAngle.angle));


      const wallHeight = Math.floor(this.height / 2 / distanceRay);
   
      if (wallEntity) {
        this._drawHorizonLine(screenX, wallHeight);
        this._drawFloorLine(screenX, wallHeight, rayAngle, player);
        this._drawWallLine(screenX, rayX, rayY, wallEntity, wallHeight);
      } else {
        this._drawHorizonLine(screenX, 0);
        this._drawFloorLine(screenX, 0, rayAngle, player);
      }
  
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
