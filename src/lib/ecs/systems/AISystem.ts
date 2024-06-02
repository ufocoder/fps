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
import PlayerComponent from "../components/PlayerComponent";

export default class AISystem extends System {
  public readonly componentsRequired = new Set([
    AIComponent,
    EnemyComponent,
    PositionComponent,
    AngleComponent,
    MoveComponent,
  ]);

  protected readonly soundManager: SoundManager;

  constructor(ecs: ECS, soundManager: SoundManager) {
    super(ecs);
    this.soundManager = soundManager;
  }

  start(): void {}

  update(dt: number, entities: Set<Entity>) {
    const [player] = this.ecs.query([
      PlayerComponent,
      HealthComponent,
      CircleComponent,
    ]);
    
    const playerContainer = this.ecs.getComponents(player);

    const playerPosition = playerContainer.get(PositionComponent);
    const playerCircle = playerContainer.get(CircleComponent);
    const playerHealth = playerContainer.get(HealthComponent);

    entities.forEach((entity: Entity) => {
      const components = this.ecs.getComponents(entity);

      const enemyAI = components.get(AIComponent);
      const enemyHealth = components.get(HealthComponent);
      const enemyPosition = components.get(PositionComponent);
      const enemyAngle = components.get(AngleComponent);
      const enemyCircle = components.get(CircleComponent);
      const enemyMove = components.get(MoveComponent);
      const enemyAnimation = components.get(AnimatedSpriteComponent);

      if (enemyHealth.current <= 0) {
        return;
      }

      const dx = playerPosition.x - enemyPosition.x;
      const dy = playerPosition.y - enemyPosition.y;
      const d = Math.sqrt(dx ** 2 + dy ** 2) - playerCircle.radius - enemyCircle?.radius;

      const shouldEnemyMove = enemyAI.distance > d  && d > 0;
      const shouldEnemyAttack = d <= 0;
      const shouldEnemyDamage = enemyAI.lastAttackTime >= enemyAI.frequence / 1_000

      if (shouldEnemyMove) {
        let angle = radiansToDegrees(Math.atan(dy / dx));

        enemyAnimation.switchState("walk", true);
        enemyMove.mainDirection = MainDirection.Forward;

        if (dx <= 0) {
          angle += 180
        }

        enemyAngle.angle = normalizeAngle(angle);
      } else {
        enemyMove.mainDirection = MainDirection.None;
        enemyMove.sideDirection = SideDirection.None;
        enemyAnimation.switchState("idle", true);
      }

      if (shouldEnemyAttack) {
        enemyAnimation.switchState("attack", true);
        enemyAI.lastAttackTime += dt;
      } else {
        enemyAI.lastAttackTime = 0;
      }

      if (shouldEnemyDamage) {
        this.soundManager.playSound('hurt');
        playerHealth.current = Math.max(0, playerHealth.current - enemyAI.damage);
        enemyAI.lastAttackTime = 0;
      }
    });
  }

  destroy() {}
}
