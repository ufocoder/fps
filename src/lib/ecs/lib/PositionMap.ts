import Entity from "../Entity";

export default class PositionMap {
  map: (Entity | undefined)[][];

  constructor(rows: number, cols: number) {
    this.map = Array.from({ length: rows }, () => Array.from({ length: cols }, () => undefined));
  }

  public set(x: number, y: number, entity: Entity) {
    this.map[y][x] = entity;
  }

  public get(x: number, y: number) {
    return this.has(x,y) ? this.map[y][x] : undefined;
  }

  public has(x: number, y: number) {
    return Boolean(this.map[y] && this.map[y][x]);
  }

  public clear() {
    this.map = [[]];
  }
}
