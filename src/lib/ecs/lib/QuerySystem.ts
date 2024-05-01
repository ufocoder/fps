import Entity from "../Entity";

export default class QuerySystem {

  private entitiesByQuery: Map<string, Entity[]> = new Map();

  constructor(private entities: Entity[]) {}

  protected generateKey(componentTypes: Function[]) {
    return componentTypes.map(type => type.name).sort().join(',');
  }

  query(componentTypes: Function[]): Entity[] {
    const key = this.generateKey(componentTypes);

    if (!this.entitiesByQuery.has(key)) {
      const matchingEntities = this.entities.filter((entity) =>
        componentTypes.every((type) => entity.components.has(type))
      );
      this.entitiesByQuery.set(key, matchingEntities);
    }
  
    return this.entitiesByQuery.get(key)!;
  }
}
