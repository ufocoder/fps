import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import MoveComponent, { MainDirection } from "src/lib/ecs/components/MoveComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import BulletComponent from "src/lib/ecs/components/BulletComponent";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import { ComponentContainer } from "src/lib/ecs/Component";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import { distance } from "src/lib/utils";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import SoundManager from "src/managers/SoundManager";
import ECS from "src/lib/ecs/ExtendedECS";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";

export default class WeaponSystem extends System {
  public readonly componentsRequired = new Set([BulletComponent, CircleComponent]);

  protected readonly soundManager: SoundManager;
  
  constructor(ecs: ECS, soundManager: SoundManager) {
    super(ecs);
    this.soundManager = soundManager;
  }

  start(): void {
    this.createListeners();
  }

  update(_: number, entities: Set<Entity>) {
    const enemies = this.ecs.query([EnemyComponent, CircleComponent, HealthComponent]);

    entities.forEach((entity) => {
      const bullet = this.ecs.getComponents(entity);
      const enemy = this.hasCollision(bullet, enemies);

      if (enemy) {
        const container = this.ecs.getComponents(enemy);

        if (container) {
          const health = container.get(HealthComponent);
          const move = container.get(MoveComponent);
          const animation = container.get(AnimatedSpriteComponent);

          health.current -= bullet.get(BulletComponent).damage;

          if (health.current <= 0) {
            animation.switchState("death", false);
            move.moveSpeed = 0;
            // this.ecs.removeEntity(enemy);
            return
          }
        }
      }
    });
  }

  hasCollision(bullet: ComponentContainer, enemies: Set<Entity>): Entity | undefined  {
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

  destroy(): void {
    this.destroyListeners();
  }

  handleDocumentClick = (e: MouseEvent) => {
    e.preventDefault();

    const [player] = this.ecs.query([CameraComponent, WeaponComponent, AngleComponent, PositionComponent]);
    const playerContainer = this.ecs.getComponents(player)

    if (!playerContainer) {
      return;
    }

    const weapon = playerContainer.get(WeaponComponent);

    if (weapon.bullets <= 0) {
      return
    }

    this.soundManager.playSound('gun-shot');

    const entity = this.ecs.addEntity();

    weapon.bullets -= 1;

    this.ecs.addComponent(entity, new BulletComponent(weapon.damage));
    this.ecs.addComponent(entity, new PositionComponent(playerContainer.get(PositionComponent).x, playerContainer.get(PositionComponent).y));
    this.ecs.addComponent(entity, new AngleComponent(playerContainer.get(AngleComponent).angle));
    this.ecs.addComponent(entity, new CircleComponent(0.25));
    this.ecs.addComponent(entity, new MinimapComponent('yellow'));
    this.ecs.addComponent(entity, new MoveComponent(10, MainDirection.Forward));
  };

  createListeners() {
    document.addEventListener("click", this.handleDocumentClick);
  }

  destroyListeners() {
    document.removeEventListener("click", this.handleDocumentClick);
  }
}
