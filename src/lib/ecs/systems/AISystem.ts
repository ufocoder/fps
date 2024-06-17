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
      const shouldEnemyBeActivated = enemyAI.activateDistance > d;
      const shouldEnemyBeMoved = enemyWeapon.attackDistance < d && d > 0

      if (!shouldEnemyBeActivated) {
        enemyAnimation.switchState("idle", true);
        enemyMove.mainDirection = MainDirection.None;
        enemyMove.sideDirection = SideDirection.None;
        return;
      }

      const angle = dx <= 0 
        ? radiansToDegrees(Math.atan(dy / dx)) + 180
        : radiansToDegrees(Math.atan(dy / dx));

      enemyAngle.angle = normalizeAngle(angle);
      
      if (shouldEnemyBeMoved) {
        enemyAnimation.switchState("walk", true);
        enemyMove.mainDirection = MainDirection.Forward;
      } else {
        enemyMove.mainDirection = MainDirection.None;
        enemyMove.sideDirection = SideDirection.None;
      }

      if (!hasEnemyWeapon) {
        return;
      }

      const shouldEnemyAttack =  enemyWeapon.attackDistance >= d;
      const shouldEnemyDamage = enemyAI.actionPassedTime >= enemyWeapon.attackFrequency / 1_000;

      if (shouldEnemyAttack) {
        enemyAnimation.switchState("attack", true);
        enemyAI.actionPassedTime += dt;
      } else {
        enemyAI.actionPassedTime = 0;
      }
  
      if (shouldEnemyDamage) {
        enemyAI.actionPassedTime = 0;

        const entity = this.ecs.addEntity();
        const sprite = this.textureManager.get(enemyWeapon.bulletSpriteId);
        const radius = enemyWeapon.attackDistance === 0 ? enemyCircle.radius : 0.25;

        this.ecs.addComponent(entity, new CollisionComponent());
        if (sprite) {
          this.ecs.addComponent(entity, new SpriteComponent(sprite));
        }
        this.ecs.addComponent(entity, new BulletComponent(enemy, enemyWeapon.bulletDamage));
        this.ecs.addComponent(entity, new PositionComponent(enemyPosition.x, enemyPosition.y));
        this.ecs.addComponent(entity, new AngleComponent(enemyAngle.angle));
        this.ecs.addComponent(entity, new CircleComponent(radius));
        this.ecs.addComponent(entity, new MinimapComponent('yellow'));
        this.ecs.addComponent(entity, new MoveComponent(enemyWeapon.bulletSpeed, false, MainDirection.Forward));

        // one frame live entity
        if (enemyWeapon.attackDistance === 0) {
          this.ecs.removeEntity(entity);
        }
      }
    });
  }

  destroy() {}
}
