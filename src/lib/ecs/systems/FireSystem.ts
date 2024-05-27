import System from "src/lib/ecs/System";
import { Entity } from "../Entity";
import PositionComponent from "../components/PositionComponent";
import CameraComponent from "../components/CameraComponent";
import AngleComponent from "../components/AngleComponent";
import MoveComponent, { MainDirection } from "../components/MoveComponent";
import CircleComponent from "../components/CircleComponent";
import MinimapComponent from "../components/MinimapComponent";
import BulletComponent from "../components/BulletComponent";
import EnemyComponent from "../components/EnemyComponent";
import { ComponentContainer } from "../Component";
import HealthComponent from "../components/HealthComponent";
import { distance } from "src/lib/utils";
import WeaponComponent from "../components/WeaponComponent";

const spaceKeyCode = "Space";

export default class FireSystem extends System {
  componentsRequired = new Set([BulletComponent, CircleComponent]);
  
  start(): void {
    this.createListeners();
  }

  update(_: number, entities: Set<Entity>) {
    const now = +new Date();
    const enemies = this.ecs.query([EnemyComponent, CircleComponent, HealthComponent]);

    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity);

      if (now - components.get(BulletComponent).createdAt > 500) {
        this.ecs.removeEntity(entity);
        return;
      }

      const enemy = this.hasCollision(components, enemies);

      if (enemy) {
        const health = enemy.get(HealthComponent);

        health.current -= components.get(BulletComponent).damage;

        console.log(health.current);
        if (health.current <= 0) {
          this.ecs.removeEntity(entity);
          return
        }
      }
    });
  }

  hasCollision(bullet: ComponentContainer, enemies: ComponentContainer[]): ComponentContainer | undefined  {
    const bulletCircle = bullet.get(CircleComponent);
    const bulletPosition = bullet.get(PositionComponent);

    return enemies.find(enemy => {
        const enemyCircle = enemy.get(CircleComponent);
        const enemyPosition = enemy.get(PositionComponent);
        const d = distance(bulletPosition.x, bulletPosition.y, enemyPosition.x, enemyPosition.y);
        
        return d <= bulletCircle.radius + enemyCircle.radius;
    });
  }

  destroy(): void {
    this.destroyListeners();
  }

  handleDocumentKeyDown = (e: KeyboardEvent) => {
    if (e.code !== spaceKeyCode) {
      return
    }

    e.preventDefault();

    const [player] = this.ecs.query([CameraComponent, WeaponComponent, AngleComponent, PositionComponent]);

    if (!player) {
      return;
    }

    const weapon = player.get(WeaponComponent);
    const entity = this.ecs.addEntity();

    this.ecs.addComponent(entity, new BulletComponent(weapon.damage));
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
