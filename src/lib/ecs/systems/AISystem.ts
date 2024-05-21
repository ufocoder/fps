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

export default class AISystem extends System {
  componentsRequired = new Set([AIComponent, AnimatedSpriteComponent, CircleComponent, PositionComponent]);

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
    this.ecs.query([PositionComponent, TextureComponent]).forEach(container => {
      if (container.has(CameraComponent)) {
        return;
      }

      const position = container.get(PositionComponent);

      this.textureMap.set(
        Math.floor(position.x),
        Math.floor(position.y),
        container
      );
    })
  }

  update(dt: number, entities: Set<Entity>) {
    const [camera] = this.ecs.query([HealthComponent, CircleComponent, CameraComponent]);

    const cameraPosition = camera.get(PositionComponent);
    const cameraCircle = camera.get(CircleComponent);
    const cameraHealth = camera.get(HealthComponent);

    entities.forEach((entity: Entity) => {
      const components = this.ecs.getComponents(entity);
      const entityAI = components.get(AIComponent);
      const entityPosition = components.get(PositionComponent);
      const entityCircle = components.get(CircleComponent);
      const entityAnimation = components.get(AnimatedSpriteComponent);

      const dx = cameraPosition.x - entityPosition.x;
      const dy = cameraPosition.y - entityPosition.y;
      const distance = Math.sqrt(dx**2 + dy**2) - cameraCircle.radius - entityCircle.radius;

      // @TODO: move to move system
      if (entityAI.distance > distance && distance > 0) {
        entityAnimation.switchState('walk');
        const newX = entityPosition.x + dx * dt * entityAI.moveSpeed;
        const newY = entityPosition.y + dy * dt * entityAI.moveSpeed;
        if (!this.textureMap.has(Math.floor(newX), Math.floor(newY))) {
          entityPosition.x = newX;
          entityPosition.y = newY;
        }
      } else {
        entityAnimation.switchState('idle');
      }

      if (distance <= 0) {
        entityAnimation.switchState('attack');
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

  destroy(){}

}