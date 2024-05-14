import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import QuerySystem from "../lib/QuerySystem";
import AIComponent from "../components/AIComponent";
import CameraComponent from "../components/CameraComponent";
import CircleComponent from "../components/CircleComponent";
import HealthComponent from "../components/HealthComponent";
import AnimatedSpriteComponent from "../components/AnimationComponent";

export default class AISystem extends System {
  requiredComponents = [AIComponent, CircleComponent, PositionComponent];
  camera: Entity;

  constructor(querySystem: QuerySystem) {
    super(querySystem);
    const [camera] = this.querySystem.query([HealthComponent, CircleComponent, CameraComponent]);

    this.camera = camera;
  }

  start(){ }

  update(dt: number, entities: Entity[]) {
    const cameraPosition = this.camera.getComponent(PositionComponent);
    const cameraCircle = this.camera.getComponent(CircleComponent);
    const cameraHealth = this.camera.getComponent(HealthComponent);

    entities.forEach((entity: Entity) => {
      const entityAI = entity.getComponent(AIComponent);
      const entityPosition = entity.getComponent(PositionComponent);
      const entityCircle = entity.getComponent(CircleComponent);
      const entityAnimation = entity.getComponent(AnimatedSpriteComponent);

      const dx = cameraPosition.x - entityPosition.x;
      const dy = cameraPosition.y - entityPosition.y;

      const distance = Math.sqrt(dx**2 + dy**2) - cameraCircle.radius - entityCircle.radius;

      // @TODO: move to move system
      if (entityAI.distance > distance) {
        entityAnimation.switchState('walk');
        entityPosition.x += dx * dt * entityAI.moveSpeed;
        entityPosition.y += dy * dt * entityAI.moveSpeed;
      } else {
        entityAnimation.switchState('idle');
      }

      if (distance < 0) {
        entityAI.lastAttackTime += dt;
      } else {
        entityAI.lastAttackTime = 0;
      }

      if (entityAI.lastAttackTime >= 1) {
        cameraHealth.current -= entityAI.damagePerSecond;
        entityAI.lastAttackTime = 0;
      }
    });
  }

  destroy(){}

}