import ECS from "src/lib/ecs";
import { Entity } from "src/lib/ecs/Entity";

export default abstract class System {
    public ecs: ECS;

    public readonly abstract componentsRequired: Set<Function>;

    constructor(ecs: ECS) {
        this.ecs = ecs;
    }

    abstract start(): void;
    abstract update(dt: number, entities: Set<Entity>): void;
    abstract destroy(): void;
}
