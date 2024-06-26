import { Component, ComponentContainer } from "./Component";
import { Entity } from "./Entity";
import System from "./System";

type EntityCallback = (entity: Entity) => void;

export default class ECS {
    protected entities = new Map<Entity, ComponentContainer>();
    protected systems = new Map<System, Set<Entity>>()

    protected componentAddCallbacks: Map<Function, Set<EntityCallback>> = new Map();
    protected componentRemoveCallbacks: Map<Function, Set<EntityCallback>> = new Map();

    protected nextEntityID = 0;
    protected entitiesToDestroy = new Array<Entity>();

    public start(): void {
        for (const system of this.systems.keys()) {
            system.start();
        }
    }

    public update(dt: number): void {
        for (const [system, entities] of this.systems.entries()) {
            system.update(dt, entities);
        }

        while (this.entitiesToDestroy.length > 0) {
            this.destroyEntity(this.entitiesToDestroy.pop()!);
        }
    }   

    public destroy(): void {
        for (const system of this.systems.keys()) {
            system.destroy();
        }
    }

    protected entitiesByQuery = new Map<string, Set<Entity>>();

    public query(componentClasses: Function[]): Set<Entity> {
        const matchingEntities = new Set<Entity>();

        for (const [entity, components] of this.entities.entries()) {
            if (components.all(componentClasses)) {
                matchingEntities.add(entity);
            }
        }

        return matchingEntities
    }

    public addEntity(): Entity {
        const entity = this.nextEntityID;

        this.nextEntityID++;
        this.entities.set(entity, new ComponentContainer());

        return entity;
    }

    public removeEntity(entity: Entity)  {
        this.entitiesToDestroy.push(entity);
    }

    private syncEntity(entity: Entity): void {
        for (const system of this.systems.keys()) {
            this.syncSystem(entity, system);
        }
    }

    private destroyEntity(entity: Entity) {
        this.entities.delete(entity);
        for (const entities of this.systems.values()) {
            entities.delete(entity);
        }
    }


    public getComponents(entity: Entity) {
        return this.entities.get(entity)!;
    }

    public addComponent(entity: Entity, component: Component) {
        this.entities.get(entity)?.add(component);
        this.syncEntity(entity);
        this.componentAddCallbacks.get(component.constructor)?.forEach(cb => cb(entity));
    }

    public onComponentAdd(componentClass: Function, callback: EntityCallback) {
        if (this.componentAddCallbacks.has(componentClass)) {
            this.componentAddCallbacks.set(componentClass, new Set());
        }
        this.componentAddCallbacks.get(componentClass)?.add(callback);
    }

    public removeComponent(entity: Entity, componentClass: Function) {
        this.entities.get(entity)?.delete(componentClass);
        this.syncEntity(entity);

        this.componentRemoveCallbacks.get(componentClass)?.forEach(cb => cb(entity));
    }

    public onComponentRemove(componentClass: Function, callback: EntityCallback) {
        this.componentRemoveCallbacks.get(componentClass)?.delete(callback);
    }

    public addSystem(system: System) {
        if (system.componentsRequired.size == 0) {
            return;
        }

        this.systems.set(system, new Set());

        for (const entity of this.entities.keys()) {
            this.syncSystem(entity, system);
        }
    }

    public getSystem<T extends System>(systemClass: { new (...args:any[]): T }): T | undefined {
        for (const system of this.systems.keys()) {
            if (system instanceof systemClass) {
                return system;
            }
        }
    }

    private syncSystem(entity: Entity, system: System): void {
        const components = this.entities.get(entity);

        if (components) {
            if (components.all(system.componentsRequired)) {
                this.systems.get(system)!.add(entity); 
            } else {
                this.systems.get(system)!.delete(entity);
            }
        }
    }

    public removeSystem(system: System): void {
        this.systems.delete(system);
    }
}