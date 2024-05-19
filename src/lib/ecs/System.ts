import ECS from ".";
import { Entity } from "./Entity";

export default abstract class System {
    public ecs: ECS;

    public abstract componentsRequired: Set<Function>;

    constructor(ecs: ECS) {
        this.ecs = ecs;
    }

    abstract start(): void;
    abstract update(dt: number, entities: Set<Entity>): void;
    abstract destroy(): void;
}
