import ECS from "src/lib/ecs/ExtendedECS";
import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";
import SoundManager from "src/managers/SoundManager";
import ItemComponent from "src/lib/ecs/components/ItemComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import HealthComponent from "../components/HealthComponent";
import WeaponComponent from "../components/WeaponComponent";
export default class MapItemSystem extends System {
  public readonly componentsRequired = new Set([
    PositionComponent,
    ItemComponent,
  ]);

  protected readonly soundManager: SoundManager;

  constructor(ecs: ECS, soundManager: SoundManager) {
    super(ecs);

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
    const playerWeapon = playerContainer.get(WeaponComponent);

    entities.forEach(entity => {
      const entityItem = this.ecs.getComponents(entity).get(ItemComponent);
      const entityPosition = this.ecs.getComponents(entity).get(PositionComponent);

      if (Math.floor(playerPosition.x) === Math.floor(entityPosition.x) && Math.floor(playerPosition.y) === Math.floor(entityPosition.y)) {

        this.soundManager.playSound('pick');

        if (playerWeapon && entityItem.type === "ammo") {
          playerWeapon.bulletTotal += entityItem.value;
        }

        if (playerHealth && entityItem.type === "health_pack") {
          playerHealth.current += entityItem.value;
        }

        this.ecs.removeEntity(entity)
      }
    })
  }

  destroy(): void {}
}
