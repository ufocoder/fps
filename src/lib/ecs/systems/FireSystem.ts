import System from "src/lib/ecs/System";
import { Entity } from "../Entity";
import PositionComponent from "../components/PositionComponent";
import CameraComponent from "../components/CameraComponent";
import AngleComponent from "../components/AngleComponent";
import MoveComponent, { MainDirection } from "../components/MoveComponent";
import CircleComponent from "../components/CircleComponent";
import MinimapComponent from "../components/MinimapComponent";
import BulletComponent from "../components/BulletComponent";
import CollisionComponent from "../components/CollisionComponent";

const spaceKeyCode = "Space";

export default class WeaponSystem extends System {
  componentsRequired = new Set([BulletComponent]);
  
  start(): void {
    this.createListeners();
  }

  update(_: number, entities: Set<Entity>) {
    const now = +new Date();

    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);

      if (now - components.get(BulletComponent).createdAt > 2 * 1_000) {
        this.ecs.removeEntity(entity);
      }

      if (components.get(CollisionComponent).isCollided) {
        this.ecs.removeEntity(entity);
      }
    })
  }

  destroy(): void {
    this.destroyListeners();
  }

  handleDocumentKeyDown = (e: KeyboardEvent) => {
    if (e.code !== spaceKeyCode) {
      return
    }

    e.preventDefault();

    const [player] = this.ecs.query([CameraComponent, AngleComponent, PositionComponent]);

    if (!player) {
      return;
    }

    const entity = this.ecs.addEntity();

    this.ecs.addComponent(entity, new PositionComponent(player.get(PositionComponent).x, player.get(PositionComponent).y));
    this.ecs.addComponent(entity, new AngleComponent(player.get(AngleComponent).angle));
    this.ecs.addComponent(entity, new CircleComponent(0.25));
    this.ecs.addComponent(entity, new MinimapComponent('yellow'));
    this.ecs.addComponent(entity, new MoveComponent(10, MainDirection.Forward));
  };

  createListeners() {
    document.addEventListener("keydown", this.handleDocumentKeyDown);
  }

  destroyListeners() {
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
  }
}
