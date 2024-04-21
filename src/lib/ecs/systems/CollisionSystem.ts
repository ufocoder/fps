import System from "src/lib/ecs/System";
import Entity from "src/lib/ecs/Entity";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import BoxComponent from "src/lib/ecs/components/BoxComponent";

// @TODO
export default class CollisionSystem implements System {
  components = [PositionComponent, BoxComponent, CollisionComponent];

  constructor() {
    
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  update(_: number, __: Entity[]) { 
    // @TODO
  }

  destroy(): void {
    // @TODO
  }

}
