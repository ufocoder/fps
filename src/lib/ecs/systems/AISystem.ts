import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import PositionComponent from "src/lib/ecs/components/PositionComponent";

import AIComponent from "../components/AIComponent";
import CameraComponent from "../components/CameraComponent";
import CircleComponent from "../components/CircleComponent";
import HealthComponent from "../components/HealthComponent";
import AnimatedSpriteComponent from "../components/AnimationComponent";
import SoundManager from "src/managers/SoundManager";
import ECS from "src/lib/ecs";
import TextureComponent from "../components/TextureComponent";
import PositionMap from "../lib/PositionMap";
import { ComponentContainer } from "../Component";
import EnemyComponent from "../components/EnemyComponent";
import MoveComponent, { MainDirection } from "../components/MoveComponent";
import AngleComponent from "../components/AngleComponent";
import { normalizeAngle, radiansToDegrees } from "src/lib/utils";

export default class AISystem extends System {
  componentsRequired = new Set([
    AIComponent,
    EnemyComponent,
    PositionComponent,
    AngleComponent,
    MoveComponent,
  ]);

  protected readonly soundManager: SoundManager;
  protected readonly textureMap: PositionMap<ComponentContainer>;

  constructor(ecs: ECS, level: Level, soundManager: SoundManager) {
    super(ecs);
    this.soundManager = soundManager;

    const cols = level.map[0].length;
    const rows = level.map.length;

    this.textureMap = new PositionMap(cols, rows);
  }

  start(): void {
    this.ecs
      .query([PositionComponent, TextureComponent])
      .forEach((container) => {
        if (container.has(CameraComponent)) {
          return;
        }

        const position = container.get(PositionComponent);

        this.textureMap.set(
          Math.floor(position.x),
          Math.floor(position.y),
          container
        );
      });
  }

  update(dt: number, entities: Set<Entity>) {
    const [camera] = this.ecs.query([
      HealthComponent,
      CircleComponent,
      CameraComponent,
    ]);

    const cameraPosition = camera.get(PositionComponent);
    const cameraCircle = camera.get(CircleComponent);
    const cameraHealth = camera.get(HealthComponent);

    entities.forEach((entity: Entity) => {
      const components = this.ecs.getComponents(entity);
      const entityAI = components.get(AIComponent);
      const entityPosition = components.get(PositionComponent);
      const entityAngle = components.get(AngleComponent);
      const entityCircle = components.get(CircleComponent);
      const entityMove = components.get(MoveComponent);
      const entityAnimation = components.get(AnimatedSpriteComponent);

      const dx = cameraPosition.x - entityPosition.x;
      const dy = cameraPosition.y - entityPosition.y;
      const d = Math.sqrt(dx ** 2 + dy ** 2) - cameraCircle.radius - entityCircle?.radius;

      if (entityAI.distance > d  && d > 0) {
        let angle = radiansToDegrees(Math.atan(dy / dx));

        entityAnimation.switchState("walk");
        entityMove.mainDirection = MainDirection.Forward;

        if (dx <= 0) {
          angle += 180
        }

        entityAngle.angle = normalizeAngle(angle);
      } else {
        entityMove.mainDirection = MainDirection.None;
        entityAnimation.switchState("idle");
      }

      if (d <= 0) {
        entityAnimation.switchState("attack");
        entityAI.lastAttackTime += dt;
      } else {
        entityAI.lastAttackTime = 0;
      }

      if (entityAI.lastAttackTime >= 0.5) {
        this.soundManager.play('zombie-attack');
        cameraHealth.current = Math.max(0, cameraHealth.current - entityAI.damagePerSecond);
        entityAI.lastAttackTime = 0;
      }
    });
  }

  destroy() {}
}
