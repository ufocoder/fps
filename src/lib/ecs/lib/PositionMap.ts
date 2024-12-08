export default class PositionMap<T> {
  map: Map<number, T>;

  rows: number;
  cols: number;

  constructor(levelMap: LevelMap) {
    this.cols = levelMap[0].length;
    this.rows = levelMap.length;

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

  public reset(x: number, y: number) {
    return this.map.delete(y * this.cols + x);
  }

  public clear() {
    this.map.clear();
  }

  public toArray(): (T | undefined)[][] {
    const list: (T | undefined)[][] = [];
    for (let y = 0; y < this.rows; y++) {
      const row: (T | undefined)[] = [];
      for (let x = 0; x < this.cols; x++) {
        row.push(this.get(x, y));
      }
      list.push(row);
    }
    return list;
  }
}
