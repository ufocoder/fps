import { Component } from "./Component";

let entityIdCounter = 0;

function createEntityId() {
    return entityIdCounter++;
}

type ComponentClass<T extends Component> = new (...args: any[]) => T;

export default class Entity {
    readonly id: number
    readonly components: Map<Function, Component>;

    constructor() {
        this.id = createEntityId();
        this.components = new Map();
    }

    public addComponent(component: Component) {
        this.components.set(component.constructor, component);
    }

    public getComponent<T extends Component>(componentClass: ComponentClass<T>): T {
        return this.components.get(componentClass) as T;
    }

    public hasComponent(componentClass: Function): boolean {
        return this.components.has(componentClass);
    }

    public removeComponent(componentType: Function) {
        this.components.delete(componentType);
    }
}