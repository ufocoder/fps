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
import CollisionComponent from "../components/CollisionComponent";
import ECS from "src/lib/ecs/ExtendedECS";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import MoveComponent, { MainDirection } from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SoundManager from "src/managers/SoundManager";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import AnimationManager from "src/managers/AnimationManager";

export default class WeaponSystem extends System {
  public readonly componentsRequired = new Set([BulletComponent, CircleComponent]);

  protected readonly width: number = 640;
  protected readonly height: number = 480;
  protected readonly canvas: Canvas;
  protected readonly container: HTMLElement;

  protected readonly weaponSprite?: AnimatedSpriteComponent;
  protected readonly soundManager: SoundManager;
  protected readonly animationManager: AnimationManager;

  constructor(ecs: ECS, container: HTMLElement, animationManager: AnimationManager, soundManager: SoundManager) {
    super(ecs);

    this.container = container;
    this.soundManager = soundManager;
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

  update(dt: number, entities: Set<Entity>) {
    const enemies = this.ecs.query([EnemyComponent, CircleComponent, HealthComponent]);

    if (this.weaponSprite) {
      this.weaponSprite.update(dt);
      this.renderSprite();
    }

    entities.forEach((entity) => {
      const bullet = this.ecs.getComponents(entity);

      if (bullet.get(CollisionComponent).isCollided) {
        this.ecs.removeEntity(entity);
        return;
      }

      const enemy = this.findEnemyCollision(bullet, enemies);

      if (enemy) {
        const container = this.ecs.getComponents(enemy);
        const health = container.get(HealthComponent);
        const animation = container.get(AnimatedSpriteComponent);

        if (health.current > 0) {
          health.current -= bullet.get(BulletComponent).damage;
        }

        if (health.current <= 0) {
          this.ecs.removeComponent(enemy, MoveComponent);
          this.ecs.removeComponent(enemy, HealthComponent);
          this.ecs.removeComponent(enemy, AIComponent);

          if (animation) {
            animation.switchState("death", false);
          }
        }

        this.ecs.removeEntity(entity);
      }
    });
  }

  findEnemyCollision(bullet: ComponentContainer, enemies: Set<Entity>): Entity | undefined  {
    const bulletCircle = bullet.get(CircleComponent);
    const bulletPosition = bullet.get(PositionComponent);

    for (const enemy of enemies) {
      const container = this.ecs.getComponents(enemy);
      const enemyCircle = container.get(CircleComponent);
      const enemyPosition = container.get(PositionComponent);
      const d = distance(bulletPosition.x, bulletPosition.y, enemyPosition.x, enemyPosition.y);

      if (d <= bulletCircle.radius + enemyCircle.radius) {
        return enemy;
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

    this.ecs.addComponent(entity, new BulletComponent(weapon.damage));
    this.ecs.addComponent(entity, new CollisionComponent());
    this.ecs.addComponent(entity, new PositionComponent(playerContainer.get(PositionComponent).x, playerContainer.get(PositionComponent).y));
    this.ecs.addComponent(entity, new AngleComponent(playerContainer.get(AngleComponent).angle));
    this.ecs.addComponent(entity, new CircleComponent(0.25));
    this.ecs.addComponent(entity, new MinimapComponent('yellow'));
    this.ecs.addComponent(entity, new MoveComponent(weapon.bulletSpeed, false, MainDirection.Forward));
  };

  createListeners() {
    document.addEventListener("click", this.handleDocumentClick);
  }

  destroyListeners() {
    document.removeEventListener("click", this.handleDocumentClick);
  }
}
