import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import AIComponent from "src/lib/ecs/components/AIComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import MoveComponent, { MainDirection, SideDirection } from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import SoundManager from "src/managers/SoundManager";
import { normalizeAngle, radiansToDegrees } from "src/lib/utils";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import WeaponComponent from "src/lib/ecs/components/WeaponComponent";
import BulletComponent from "src/lib/ecs/components/BulletComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import TextureManager from "src/managers/TextureManager";
import SpriteComponent from "../components/SpriteComponent";

export default class AISystem extends System {
  public readonly componentsRequired = new Set([
    AIComponent,
    EnemyComponent,
    PositionComponent,
    AngleComponent,
    MoveComponent,
  ]);

  protected readonly soundManager: SoundManager;
  protected readonly textureManager: TextureManager;

  constructor(ecs: ECS, textureManager: TextureManager, soundManager: SoundManager) {
    super(ecs);
    this.soundManager = soundManager;
    this.textureManager = textureManager;
  }

  start(): void {}

  update(dt: number, enemies: Set<Entity>) {
    const [player] = this.ecs.query([
      PlayerComponent,
      HealthComponent,
      CircleComponent,
    ]);
    
    if (typeof player === "undefined") {
      return;
    }

    const playerContainer = this.ecs.getComponents(player);

    const playerPosition = playerContainer.get(PositionComponent);
    const playerCircle = playerContainer.get(CircleComponent);
    const playerHealth = playerContainer.get(HealthComponent);

    enemies.forEach((enemy: Entity) => {
      const components = this.ecs.getComponents(enemy);

      const enemyAI = components.get(AIComponent);
      const enemyHealth = components.get(HealthComponent);
      const enemyPosition = components.get(PositionComponent);
      const enemyAngle = components.get(AngleComponent);
      const enemyCircle = components.get(CircleComponent);
      const enemyMove = components.get(MoveComponent);
      const enemyAnimation = components.get(AnimatedSpriteComponent);
      const enemyWeapon = components.get(WeaponComponent);
      const hasEnemyWeapon = Boolean(enemyWeapon);

      if (enemyHealth.current <= 0) {
        return;
      }

      const dx = playerPosition.x - enemyPosition.x;
      const dy = playerPosition.y - enemyPosition.y;
      const d = Math.sqrt(dx ** 2 + dy ** 2) - playerCircle.radius - enemyCircle?.radius;

      const shouldEnemyBeActivated = enemyAI.distance > d  && d > 0;

      if (!shouldEnemyBeActivated) {
        enemyMove.mainDirection = MainDirection.None;
        enemyMove.sideDirection = SideDirection.None;
        enemyAnimation.switchState("idle", true);
        return;
      }

      const angle = dx <= 0 
        ? radiansToDegrees(Math.atan(dy / dx)) + 180
        : radiansToDegrees(Math.atan(dy / dx));

      enemyAngle.angle = normalizeAngle(angle);
      enemyAnimation.switchState("walk", true);
    

      const shouldEnemyAttack = hasEnemyWeapon || d <= 0;
      const shouldEnemyDamage = enemyAI.lastAttackTime >= enemyAI.frequence / 1_000;

      if (shouldEnemyAttack) {
        enemyAnimation.switchState("attack", true);
        enemyAI.lastAttackTime += dt;
      } else {
        enemyAI.lastAttackTime = 0;
      }
          
      if (shouldEnemyDamage) {
        enemyAI.lastAttackTime = 0;
        if (hasEnemyWeapon) {
          const entity = this.ecs.addEntity();
          // @TODO: take texture from weapon
          const sprite = this.textureManager.get('shotgun_bullet');

          this.ecs.addComponent(entity, new BulletComponent(enemy, enemyWeapon.damage));
          this.ecs.addComponent(entity, new CollisionComponent());
          this.ecs.addComponent(entity, new SpriteComponent(sprite));
          this.ecs.addComponent(entity, new PositionComponent(enemyPosition.x, enemyPosition.y));
          this.ecs.addComponent(entity, new AngleComponent(enemyAngle.angle));
          this.ecs.addComponent(entity, new CircleComponent(0.25));
          this.ecs.addComponent(entity, new MinimapComponent('yellow'));
          this.ecs.addComponent(entity, new MoveComponent(enemyWeapon.bulletSpeed, false, MainDirection.Forward));
        } else {
          // @TODO: refactor
          enemyMove.mainDirection = MainDirection.Forward;
          this.soundManager.playSound('hurt');
          playerHealth.current = Math.max(0, playerHealth.current - enemyAI.damage);
        }
      }
    });
  }

  destroy() {}
}
