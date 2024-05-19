export interface Component {}

export type ComponentClass<T extends Component> = new (...args: any[]) => T

export class ComponentContainer {
    private map = new Map<Function, Component>()

    public add(component: Component): void {
        this.map.set(component.constructor, component);
    }

    public get<T extends Component>(componentClass: ComponentClass<T>): T {
        return this.map.get(componentClass) as T;
    }

    public has(componentClass: Function): boolean {
        return this.map.has(componentClass);
    }

    public all(componentClasses: Iterable<Function>): boolean {
        for (const componentClass of componentClasses) {
            if (!this.map.has(componentClass)) {
                return false;
            }
        }
        return true;
    }

    public delete(componentClass: Function): void {
        this.map.delete(componentClass);
    }
}