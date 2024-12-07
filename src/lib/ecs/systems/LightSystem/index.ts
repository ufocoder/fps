import System from "src/lib/ecs/System.ts";
import { Entity } from "src/lib/ecs/Entity.ts";
import LightComponent from "src/lib/ecs/components/LightComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import { ComponentContainer } from "src/lib/ecs/Component.ts";
import MapTextureSystem from "src/lib/ecs/systems/MapTextureSystem.ts";
import RenderSystem from "src/lib/ecs/systems/RenderSystem";

import { LightCasting2D } from "./LightCasting2D.ts";

export default class LightSystem extends System {
  public readonly componentsRequired = new Set([LightComponent]);
  private lastUpdateTime = 0;
  private updatePerSecond = 30;
  private quality = 16;
  private globalLightLevel = 0.1;
  private lightBias = 0.01;
  private existedLights = new Set<Entity>();
  private listOfLightnings: {
    entity: number;
    cmp: LightComponent;
    lightCasting: LightCasting2D;
    pos: Vector2D;
  }[] = [];

  start(): void {
    this.ecs.onComponentAdd(LightComponent, (entity) => {
      const light = this.ecs.getComponents(entity).get(LightComponent);
      const pos = this.ecs.getComponents(entity).get(PositionComponent);
      this.listOfLightnings.push({
        entity,
        cmp: light,
        lightCasting: new LightCasting2D(light.distance, this.quality),
        pos,
      });
      this.existedLights.add(entity);
    });
    this.ecs.onComponentRemove(LightComponent, (entity) => {
      this.existedLights.delete(entity);
      this.listOfLightnings = this.listOfLightnings.filter(
        (lightCastingInstance) => lightCastingInstance.entity !== entity,
      );
    });
  }

  destroy(): void {
    this.listOfLightnings.length = 0;
  }

  update(_: number, entities: Set<Entity>) {
    for (const entity of entities) {
      if (this.existedLights.has(entity)) continue;
      const lightCmp = this.ecs.getComponents(entity).get(LightComponent);
      const pos = this.ecs.getComponents(entity).get(PositionComponent);
      this.listOfLightnings.push({
        entity,
        cmp: lightCmp,
        lightCasting: new LightCasting2D(lightCmp.distance, this.quality),
        pos,
      });
      this.existedLights.add(entity);
    }

    if (Date.now() - this.lastUpdateTime > 1000 / this.updatePerSecond) {
      this.lastUpdateTime = Date.now();

      for (let i = 0; i < this.listOfLightnings.length; i++) {
        this.listOfLightnings[i].pos = this.ecs
          .getComponents(this.listOfLightnings[i].entity)
          .get(PositionComponent);
        this.updateLight(
          this.listOfLightnings[i].lightCasting,
          this.ecs.getComponents(this.listOfLightnings[i].entity),
        );
      }
    }
  }

  updateLight(
    lightCastingInstance: LightCasting2D,
    container: ComponentContainer,
  ) {
    const lightCmp = container.get(LightComponent);
    if (
      !lightCmp.isStaticLight ||
      lightCastingInstance.worldEdges.length === 0
    ) {
      const renderSystem = this.ecs.getSystem(RenderSystem)!;

      const map = this.ecs.getSystem(MapTextureSystem)!.textureMap;
      lightCastingInstance.vecEdges = map.toArray().flatMap((el) =>
        el.flatMap((mapEntity) => {
          if (!mapEntity) return [];
          const renderer = renderSystem.mapEntityRenders.find((render) =>
            render.canRender(mapEntity!),
          );
          if (!renderer) return [];
          return renderer.getArmature(mapEntity);
        }),
      );
    }
    if (
      !lightCmp.isStaticLight ||
      lightCastingInstance.vecVisibilityPolygonPoints.length === 0
    ) {
      const positionCmp = container.get(PositionComponent);
      lightCastingInstance.calculateVisibilityPolygon(
        positionCmp.x,
        positionCmp.y,
      );
    }
  }

  getLightingLevelForPoint(x: number, y: number) {
    let finalLightLevel = this.globalLightLevel;
    for (let i = 0; i < this.listOfLightnings.length; i++) {
      const val = this.listOfLightnings[i];
      const lightPower = val.lightCasting.getLightLevelInPoint(
        x + (val.pos.x - x) * this.lightBias,
        y + (val.pos.y - y) * this.lightBias,
      );
      const lightLevel = val.cmp.brightness * val.cmp.lightFn(lightPower);
      finalLightLevel += lightLevel;
    }
    return finalLightLevel;
  }
}
