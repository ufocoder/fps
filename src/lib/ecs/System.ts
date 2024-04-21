import Entity from "./Entity";

export default interface System {
    components: Array<Function>;
    update(dt: number, entities: Entity[]): void;
    destroy(): void;
}
