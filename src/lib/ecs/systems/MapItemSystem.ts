import ECS from "src/lib/ecs";
import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import SoundManager from "src/managers/SoundManager";
import AnimationManager from "src/managers/AnimationManager";
import ItemComponent from "src/lib/ecs/components/ItemComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import HealthComponent from "../components/HealthComponent";
import WeaponRangeComponent from "../components/WeaponRangeComponent";
import AnimatedSpriteComponent from "../components/AnimatedSpriteComponent";

export default class MapItemSystem extends System {
  public readonly componentsRequired = new Set([
    PositionComponent,
    ItemComponent,
  ]);

  protected readonly animationManager: AnimationManager;
  protected readonly soundManager: SoundManager;

  constructor(ecs: ECS, animationManager: AnimationManager, soundManager: SoundManager) {
    super(ecs);

    this.animationManager = animationManager;
    this.soundManager = soundManager;
  }

  start(): void {}

  update(_: number, entities: Set<Entity>) {
    const [player] = this.ecs.query([
      PlayerComponent,
      PositionComponent,
    ]);

    const playerContainer = this.ecs.getComponents(player);

    if (!playerContainer) {
      return;
    }

    const playerPosition = playerContainer.get(PositionComponent);
    const playerHealth = playerContainer.get(HealthComponent);
    const playerWeapon = playerContainer.get(WeaponRangeComponent);

    entities.forEach(entity => {
      const entityItem = this.ecs.getComponents(entity).get(ItemComponent);
      const entityPosition = this.ecs.getComponents(entity).get(PositionComponent);

      if (Math.floor(playerPosition.x) === Math.floor(entityPosition.x) && Math.floor(playerPosition.y) === Math.floor(entityPosition.y)) {
        this.soundManager.playSound('pick');

        if (!playerWeapon && entityItem.type === "pistol") {
          this.ecs.addComponent(player, new WeaponRangeComponent({
            bulletSprite: 'pistol_bullet',
            bulletTotal: 30,
            bulletDamage: 100,
            bulletSpeed: 15,
            attackDistance: 15,
            attackFrequency: 250,
            sprite: new AnimatedSpriteComponent('idle', {
              attack: this.animationManager.get("pistolAttack"),
              idle: this.animationManager.get("pistolIdle"),
            }),
          }));
          this.ecs.removeEntity(entity)
        }

        if (playerWeapon && entityItem.type === "ammo") {
          playerWeapon.bulletTotal += entityItem.value;
          this.ecs.removeEntity(entity)
        }

        if (playerHealth && entityItem.type === "health_pack") {
          playerHealth.current += entityItem.value;
          this.ecs.removeEntity(entity)
        }

        
      }
    })
  }

  destroy(): void {}
}
