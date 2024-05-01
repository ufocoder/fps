import Entity from "./Entity";
import QuerySystem from "./lib/QuerySystem";

export default abstract class BaseSystem {
    querySystem: QuerySystem;
    
    requiredComponents: Array<Function> = [];

    constructor(querySystem: QuerySystem) {
        this.querySystem = querySystem;
    }

    abstract start(): void;
    abstract update(dt: number, entities: Entity[]): void;
    abstract destroy(): void;
}
