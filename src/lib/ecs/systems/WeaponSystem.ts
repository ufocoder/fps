import System from "src/lib/ecs/System";
import { ComponentContainer } from "src/lib/ecs/Component";
import { distance } from "src/lib/utils";
import { Entity } from "src/lib/ecs/Entity";
import Canvas from "src/lib/Canvas/BufferCanvas";
import AIComponent from "src/lib/ecs/components/AIComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import BulletComponent from "src/lib/ecs/components/BulletComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import CollisionComponent from "src/lib/ecs//components/CollisionComponent";
import ECS from "src/lib/ecs/ExtendedECS";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import MoveComponent, { MainDirection } from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SoundManager from "src/managers/SoundManager";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import AnimationManager from "src/managers/AnimationManager";
import TextureManager from "src/managers/TextureManager";
import SpriteComponent from "../components/SpriteComponent";

export default class WeaponSystem extends System {
  public readonly componentsRequired = new Set([BulletComponent, CircleComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  protected readonly weaponSprite?: AnimatedSpriteComponent;
  protected readonly soundManager: SoundManager;
  protected readonly textureManager: TextureManager;
  protected readonly animationManager: AnimationManager;
  
  constructor(ecs: ECS, container: HTMLElement, animationManager: AnimationManager, textureManager: TextureManager, soundManager: SoundManager) {
    super(ecs);
  
    this.container = container;
    this.soundManager = soundManager;
    this.textureManager = textureManager;
    this.animationManager = animationManager;

    this.canvas = new Canvas({
      id: 'weapon',
      height: this.height,
      width: this.width,
    });

    this.weaponSprite = new AnimatedSpriteComponent('idle', {
      attack: animationManager.get("pistolAttack"),
      idle: animationManager.get("pistolIdle"),
    });
  }

  start(): void {
    this.container.appendChild(this.canvas.element);
    this.createListeners();
  }
  
  destroy(): void {
    this.canvas.element.remove();
    this.destroyListeners();
  }

  renderSprite() {
    if (this.weaponSprite) {
      const texture = this.weaponSprite.sprite;

      this.canvas.clear();
      this.canvas.createBufferSnapshot();
      this.canvas.drawImage({
        x: this.width / 2 - texture.width / 2, 
        y: this.height - texture.height, 
        texture,
      });
      this.canvas.commitBufferSnapshot();
    }

  }

  update(dt: number, bullets: Set<Entity>) {
    if (this.weaponSprite) {
      this.weaponSprite.update(dt);
      this.renderSprite();
    }

    const entities = this.ecs.query([CircleComponent, HealthComponent]);

    bullets.forEach((bullet) => {
      const bulletContainer = this.ecs.getComponents(bullet);
      const bulletCollision = bulletContainer.get(CollisionComponent);

      if (bulletCollision.isCollided) {
        this.ecs.removeEntity(bullet);
        return;
      }

      const entity = this.findBulletCollision(bulletContainer, entities);

      if (typeof entity !== "undefined") {
        const entityContainer = this.ecs.getComponents(entity);
        const entityHealth = entityContainer.get(HealthComponent);
        const entityAnimation = entityContainer.get(AnimatedSpriteComponent);

        if (entityHealth.current > 0) {
          entityHealth.current -= bulletContainer.get(BulletComponent).damage;
        }
        
        if (entityHealth.current <= 0) {
          this.ecs.removeComponent(entity, MoveComponent);
          this.ecs.removeComponent(entity, HealthComponent);
          this.ecs.removeComponent(entity, AIComponent);

          if (entityAnimation) {
            entityAnimation.switchState("death", false);
          }
        }

        this.ecs.removeEntity(bullet);
      }
    });
  }

  findBulletCollision(bullet: ComponentContainer, entities: Set<Entity>): Entity | undefined  {
    const bulletCircle = bullet.get(CircleComponent);
    const bulletPosition = bullet.get(PositionComponent);
    const bulletComponent = bullet.get(BulletComponent);

    for (const entity of entities) {
      if (bulletComponent.fromEntity === entity) {
        continue;
      } 
      const container = this.ecs.getComponents(entity);
      const entityCircle = container.get(CircleComponent);
      const entityPosition = container.get(PositionComponent);
      const d = distance(bulletPosition.x, bulletPosition.y, entityPosition.x, entityPosition.y);
      
      if (d <= bulletCircle.radius + entityCircle.radius) {
        return entity;
      }
    };
  }

  handleDocumentClick = () => {
    const [player] = this.ecs.query([PlayerComponent, WeaponComponent, AngleComponent, PositionComponent]);
    const playerContainer = this.ecs.getComponents(player)

    if (!playerContainer) {
      return;
    }

    const weapon = playerContainer.get(WeaponComponent);

    if (weapon.bulletTotal <= 0) {
      return
    }

    weapon.bulletTotal -= 1;

    this.soundManager.playSound('gun-shot');
    this.weaponSprite?.switchState('attack', false);

    const entity = this.ecs.addEntity();
    // @TODO: take texture from weapon
    const sprite = this.textureManager.get('pistol_bullet');

    this.ecs.addComponent(entity, new BulletComponent(player, weapon.damage));
    this.ecs.addComponent(entity, new CollisionComponent());
    this.ecs.addComponent(entity, new SpriteComponent(sprite));
    this.ecs.addComponent(entity, new PositionComponent(playerContainer.get(PositionComponent).x, playerContainer.get(PositionComponent).y));
    this.ecs.addComponent(entity, new AngleComponent(playerContainer.get(AngleComponent).angle));
    this.ecs.addComponent(entity, new CircleComponent(0.25));
    this.ecs.addComponent(entity, new MinimapComponent('yellow'));
    this.ecs.addComponent(entity, new MoveComponent(weapon.bulletSpeed, MainDirection.Forward));
  };

  createListeners() {
    document.addEventListener("click", this.handleDocumentClick);
  }

  destroyListeners() {
    document.removeEventListener("click", this.handleDocumentClick);
  }
}
