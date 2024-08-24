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
import ECS from "src/lib/ecs";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import MoveComponent, { MainDirection } from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SoundManager from "src/managers/SoundManager";
import WeaponRangeComponent from "src/lib/ecs/components/WeaponRangeComponent";
import WeaponMeleeComponent from "src/lib/ecs/components/WeaponMeleeComponent";
import AnimationManager from "src/managers/AnimationManager";
import TextureManager from "src/managers/TextureManager";
import SpriteComponent from "src/lib/ecs/components/SpriteComponent";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import HighlightComponent from "src/lib/ecs/components/HighlightComponent";

export const WEAPON_KNIFE_INDEX = 1;
export const WEAPON_PISTOL_INDEX = 2;
export const WEAPON_MACHINE_GUN_INDEX = 3;

export default class WeaponSystem extends System {
  public readonly componentsRequired = new Set([BulletComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  protected weaponSprite?: AnimatedSpriteComponent;
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
    const [player] = this.ecs.query([PlayerComponent]);
    const entities = this.ecs.query([CircleComponent, HealthComponent]);

    const playerComponents = this.ecs.getComponents(player);
    const playerComponent = playerComponents.get(PlayerComponent);

    this.weaponSprite = playerComponent.currentWeapon?.sprite;

    if (this.weaponSprite) {
      this.weaponSprite.update(dt);
      this.renderSprite();
    }

    bullets.forEach((bullet) => {
      const bulletContainer = this.ecs.getComponents(bullet);
      const bulletCollision = bulletContainer.get(CollisionComponent);

      if (bulletCollision.isCollided) {
        this.ecs.removeEntity(bullet);
        return;
      }

      const entity = this.findBulletCollision(bulletContainer, entities);

      if (typeof entity === "undefined") {
        return;
      }

      const entityContainer = this.ecs.getComponents(entity);

      if (!entityContainer) {
        return
      }

      const entityHealth = entityContainer.get(HealthComponent);
      const entityHighlight = entityContainer.get(HighlightComponent);

      if (!entityHealth) {
        return;
      }

      const entityAnimation = entityContainer.get(AnimatedSpriteComponent);

      if (entityHealth.current > 0) {
        if (entity === player) {
          this.soundManager.playSound('hurt');
        }

        const color = { r: 255, g: 0, b: 0, a: 1 };

        if (entityHighlight) {
          entityHighlight.color = color
          entityHighlight.startedAt = Date.now();
        } else {
          this.ecs.addComponent(entity, new HighlightComponent(color));
        }

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
    });
  }

  findBulletCollision(bullet: ComponentContainer, entities: Set<Entity>): Entity | undefined  {
    const bulletCircle = bullet.get(CircleComponent);
    const bulletPosition = bullet.get(PositionComponent);
    const bulletComponent = bullet.get(BulletComponent);

    const entityFromComponentContainer = this.ecs.getComponents(bulletComponent.fromEntity);
    const entityFromHasEnemy = entityFromComponentContainer.has(EnemyComponent);

    for (const entity of entities) {
      if (bulletComponent.fromEntity === entity) {
        continue;
      }
      const container = this.ecs.getComponents(entity);
      const entityCircle = container.get(CircleComponent);
      const entityPosition = container.get(PositionComponent);
      const hasEnemy = container.has(EnemyComponent);

      if (hasEnemy && entityFromHasEnemy) {
        continue;
      }

      const d = distance(bulletPosition.x, bulletPosition.y, entityPosition.x, entityPosition.y);

      if (d <= bulletCircle.radius + entityCircle.radius) {
        return entity;
      }
    };
  }

  handleDocumentClick = () => {
    const [player] = this.ecs.query([PlayerComponent, AngleComponent, PositionComponent]);
    const playerContainer = this.ecs.getComponents(player);
    const playerComponent = playerContainer.get(PlayerComponent);

    if (!playerComponent.currentWeapon) {
      return;
    }

    if (playerComponent.currentWeapon instanceof WeaponRangeComponent) {
      this.attackWithRange(player);
      return
    }

    if (playerComponent.currentWeapon instanceof WeaponMeleeComponent) {
      this.attackClose(player);
    }
  }

  attackClose(player: Entity) {
    const playerComponents = this.ecs.getComponents(player);
    const playerComponent = playerComponents.get(PlayerComponent);
    const playerPositionComponent = playerComponents.get(PositionComponent);
    const playerCircleComponent = playerComponents.get(CircleComponent);
    const playerWeaponComponent = playerComponent.currentWeapon as WeaponMeleeComponent;
    
    this.soundManager.playSound('attack-knife');
    this.weaponSprite?.switchState('attack', false);

    const enemies = this.ecs.query([EnemyComponent, PositionComponent, HealthComponent]);

    for (const enemy of enemies) {
      const enemyComponents = this.ecs.getComponents(enemy);
      const enemyAnimationComponent = enemyComponents.get(AnimatedSpriteComponent);
      const enemyHealthComponent = enemyComponents.get(HealthComponent);
      const enemyPositionComponent = enemyComponents.get(PositionComponent);
      const enemyCircleComponent = enemyComponents.get(CircleComponent);
      const enemyHighlightComponent = enemyComponents.get(HighlightComponent);

      const d = distance(enemyPositionComponent.x, enemyPositionComponent.y, playerPositionComponent.x, playerPositionComponent.y);

      const isCollided = d < (enemyCircleComponent.radius + playerCircleComponent.radius);
      const shouldPlayerAttack = isCollided && enemyHealthComponent.current > 0;

      if (shouldPlayerAttack) {
        enemyHealthComponent.current = Math.max(0, enemyHealthComponent.current - playerWeaponComponent.attackDamage);

        const color = { r: 255, g: 0, b: 0, a: 1 };

        if (enemyHighlightComponent) {
          enemyHighlightComponent.color = color
          enemyHighlightComponent.startedAt = Date.now();
        } else {
          this.ecs.addComponent(enemy, new HighlightComponent(color));
        }

        if (enemyHealthComponent.current <= 0 && enemyAnimationComponent) {
          enemyAnimationComponent.switchState("death", false);
        }
      }
    }
  }

  attackWithRange(player: Entity) {
    const playerComponents = this.ecs.getComponents(player);
    const playerComponent = playerComponents.get(PlayerComponent);
    const weaponRangeComponent = playerComponent.currentWeapon as WeaponRangeComponent;

    if (weaponRangeComponent.bulletTotal <= 0) {
      return
    }

    weaponRangeComponent.bulletTotal -= 1;

    this.soundManager.playSound('gun-shot');
    this.weaponSprite?.switchState('attack', false);

    const entity = this.ecs.addEntity();
    const sprite = this.textureManager.get(weaponRangeComponent.bulletSprite);

    this.ecs.addComponent(entity, new CollisionComponent());

    if (sprite) {
      this.ecs.addComponent(entity, new SpriteComponent(sprite));
    }

    this.ecs.addComponent(entity, new BulletComponent(player, weaponRangeComponent.bulletDamage));
    this.ecs.addComponent(entity, new PositionComponent(playerComponents.get(PositionComponent).x, playerComponents.get(PositionComponent).y));
    this.ecs.addComponent(entity, new AngleComponent(playerComponents.get(AngleComponent).angle));
    this.ecs.addComponent(entity, new CircleComponent(0.25));
    this.ecs.addComponent(entity, new MinimapComponent('yellow'));
    this.ecs.addComponent(entity, new MoveComponent(weaponRangeComponent.bulletSpeed, false, MainDirection.Forward));
  };

  createListeners() {
    document.addEventListener("click", this.handleDocumentClick);
  }

  destroyListeners() {
    document.removeEventListener("click", this.handleDocumentClick);
  }
}
