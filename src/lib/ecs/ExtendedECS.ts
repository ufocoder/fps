import ECS from "src/lib/ecs";
import { Entity } from "./Entity";
import { Component } from "./Component";
// import { Component } from "./Component";

type EntityCallback = (entity: Entity) => void;

export default class ExtendedECS extends ECS {
    protected cbComponentAdd: Map<Function, Set<EntityCallback>> = new Map();
    protected cbComponentDelete: Map<Function, Set<EntityCallback>> = new Map();
    protected entitiesByQuery = new Map<string, Set<Entity>>();

    public query(componentClasses: Function[]): Set<Entity> {
        // const key = componentClasses.map(type => type.name).sort().join(',');
        // if (!this.entitiesByQuery.has(key)) {
            const matchingEntities = new Set<Entity>();
            for (const [entity, components] of this.entities.entries()) {
                if (components.all(componentClasses)) {
                    matchingEntities.add(entity);
                }
            }
            // this.entitiesByQuery.set(key, matchingEntities);
        // }    
        // return this.entitiesByQuery.get(key)!;
        return matchingEntities
    }

    public onComponentAdd(componentClass: Function, cb: EntityCallback) {
        if (this.cbComponentAdd.has(componentClass)) {
            this.cbComponentAdd.set(componentClass, new Set());
        }
        this.cbComponentAdd.get(componentClass)?.add(cb);
    }

    public onComponentDelete(componentClass: Function, cb: EntityCallback) {
        this.cbComponentAdd.get(componentClass)?.delete(cb);
    }

    public addComponent(entity: Entity, component: Component) {
        super.addComponent(entity, component);

        this.cbComponentAdd.get(component.constructor)?.forEach(cb => cb(entity));
    }

    public removeComponent(entity: Entity, componentClass: Function) {
        super.removeComponent(entity, componentClass);

        this.cbComponentAdd.get(componentClass)?.forEach(cb => cb(entity));
    }
}