export default class PositionMap<T> {
  map: Map<number, T>;

  rows: number;
  cols: number;

  constructor(cols: number, rows: number) {
    this.cols = cols;
    this.rows = rows;

    this.map = new Map<number, T>();
  }

  public set(x: number, y: number, entity: T) {
    this.map.set(y * this.cols + x, entity);
  }

  public get(x: number, y: number) {
    return this.map.get(y * this.cols + x);
  }

  public has(x: number, y: number) {
    return this.map.has(y * this.cols + x);
  }

  public clear() {
    this.map.clear();
  }
}
