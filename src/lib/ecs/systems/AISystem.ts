import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import QuerySystem from "../lib/QuerySystem";
import AIComponent from "../components/AIComponent";
import CameraComponent from "../components/CameraComponent";

export default class AISystem extends System {
  requiredComponents = [AIComponent, PositionComponent];
  camera: Entity;

  constructor(querySystem: QuerySystem) {
    super(querySystem);
    const [camera] = this.querySystem.query([CameraComponent]);

    this.camera = camera;
  }

  start(){ }

  update(dt: number, entities: Entity[]) {
    const cameraPosition = this.camera.getComponent(PositionComponent);

    entities.forEach((entity: Entity) => {
      const entityAI = entity.getComponent(AIComponent);
      const entityPosition = entity.getComponent(PositionComponent);

      const dx = cameraPosition.x - entityPosition.x;
      const dy = cameraPosition.y - entityPosition.y;

      const distance = Math.sqrt(dx**2 + dy**2);

      if (entityAI.distance > distance) {
        this.moveAI(dt, dx, dy, entity);
      }
    });
  }

  moveAI(dt:number, dx: number, dy: number, entity: Entity) {
    entity.getComponent(PositionComponent).x += dx * dt 
    entity.getComponent(PositionComponent).y += dy * dt
  }

  destroy(){}
}
