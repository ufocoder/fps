import System from "src/lib/ecs/System";
import { Entity } from "src/lib/ecs/Entity";

import LightComponent from "src/lib/ecs/components/LightComponent.ts";
import PositionComponent from "src/lib/ecs/components/PositionComponent.ts";
import { ComponentContainer } from "src/lib/ecs/Component.ts";
import MapTextureSystem from "src/lib/ecs/systems/MapTextureSystem.ts";
import RenderSystem from "src/lib/ecs/systems/RenderSystem";

export class Bitmap {
  public width: number;
  public height: number;
  public scale: number;
  public scaledWidth: number;
  public scaledHeight: number;

  private readonly data: Float64Array;

  constructor(width: number, height: number, scale = 1) {
    this.width = width;
    this.height = height;

    this.scale = scale;
    this.scaledWidth = Math.round(width * scale);
    this.scaledHeight = Math.round(height * scale);

    this.data = new Float64Array(this.scaledWidth * this.scaledHeight);
  }

  clean() {
    this.data.fill(0);
  }

  set(x: number, y: number, val: number) {
    const startY = Math.floor(y * this.scale);
    const endY = Math.ceil((y + 1) * this.scale);
    const startX = Math.floor(x * this.scale);
    const endX = Math.ceil((x + 1) * this.scale);

    for (let sy = startY; sy < endY; sy++) {
      for (let sx = startX; sx < endX; sx++) {
        this.data[sy * this.scaledWidth + sx] = Math.min(1, Math.max(0, val));
      }
    }
  }

  get(x: number, y: number) {
    const sx = Math.floor(x * this.scale);
    const sy = Math.floor(y * this.scale);
    const idx = sy * this.scaledWidth + sx;
    return idx >= 0 && idx < this.data.length ? this.data[idx] : 0;
  }

  setScaled(x: number, y: number, val: number) {
    const idx = Math.floor(y * this.scaledWidth + x);
    if (idx >= 0 && idx < this.data.length) {
      this.data[idx] = Math.min(1, Math.max(0, val));
    }
  }

  getScaled(x: number, y: number) {
    const idx = Math.floor(y * this.scaledWidth + x)
    return idx >= 0 && idx < this.data.length ? this.data[idx] : 0;
  }


  getInPercents(px: number, py: number) {
    const x = Math.floor(px * this.scaledWidth);
    const y = Math.floor(py * this.scaledHeight);
    const idx = y * this.scaledWidth + x;
    return idx >= 0 && idx < this.data.length ? this.data[idx] : 0;
  }
}

const eps = 0.0001;

/** ArmatureEdge = [sx1, sy1, ex1, ey1, sx2, sy2, ex2, ey2...] */
export type ArmatureEdge = number[];

class LightCasting2D {
  public radius: number;
  public vecEdges: ArmatureEdge = [];
  public vecVisibilityPolygonPoints: {x: number, y: number, ang: number}[];
  public world: boolean[];
  public worldEdges: {edge_id: number[], edge_exist: boolean[]}[];
  public lightMap: Bitmap;
  public emitterPosition: { x: number; y: number };
  private boundingBox: { ex: number; ey: number; sx: number; sy: number };
  private readonly bendOffset: number;

  constructor(radius: number, quality = 20, bendOffset = 0) {
    this.radius = radius;
    this.vecEdges = [];
    this.vecVisibilityPolygonPoints = [];
    this.lightMap = new Bitmap(radius * 2, radius * 2, quality);
    this.world = [];
    this.worldEdges = [];
    this.emitterPosition = { x: 0, y: 0 };
    this.boundingBox = { ex: 0, ey: 0, sx: 0, sy: 0 };
    this.bendOffset = bendOffset;
  }

  calculateVisibilityPolygon(ox: number, oy: number) {
    this.emitterPosition = {x: ox, y: oy};

    this.boundingBox = {
      sx: this.emitterPosition.x - this.radius,
      sy: this.emitterPosition.y - this.radius,
      ex: this.emitterPosition.x + this.radius,
      ey: this.emitterPosition.y + this.radius,
    }

    this.vecVisibilityPolygonPoints = [];

    const countRadialRays = 40;
    const pointToLineDistance = 0.01;
    const joinPointsDistance = 0.01;

    for (let i = 0; i <= countRadialRays; i++) {
      const ang = - Math.PI + i * Math.PI * 2 / countRadialRays;
      const current = this.castLightRay(ox, oy, ang, this.radius);

      const prev2 = this.vecVisibilityPolygonPoints[this.vecVisibilityPolygonPoints.length - 2];
      const prev = this.vecVisibilityPolygonPoints[this.vecVisibilityPolygonPoints.length - 1];

      if (prev2 && prev && getDistanceFrom2DPointToLine(current.x, current.y, prev2.x, prev2.y, prev.x, prev.y) <= pointToLineDistance) {
        prev.x = current.x;
        prev.y = current.y;
      } else {
        this.vecVisibilityPolygonPoints.push(current);
      }
    }

    for (let i = 0; i < this.vecEdges.length - 1; i += 4) {
        const sx = this.vecEdges[i];
        const sy = this.vecEdges[i + 1];
        const ex = this.vecEdges[i + 2];
        const ey = this.vecEdges[i + 3];

      const bothOfEdgePointsOutOfDistance = distToSegment(ox, oy, sx, sy, ex, ey) > this.radius;
      if (bothOfEdgePointsOutOfDistance) continue;

      for (let i = 0; i < 2; i++) {
        const rdx = (i === 0 ? sx : ex) - ox;
        const rdy = (i === 0 ? sy : ey) - oy;

        let ang = 0;
        const base_ang = Math.atan2(rdy, rdx);

        for (let j = 0; j < 3; j++) {
          const delta = 0.001;
          if (j === 0) ang = base_ang - delta;
          if (j === 1) ang = base_ang;
          if (j === 2) ang = base_ang + delta;

          const vec = this.castLightRay( ox, oy, ang, this.radius);
          this.vecVisibilityPolygonPoints.push(vec);
        }
      }

    }

    this.vecVisibilityPolygonPoints.sort((p1, p2) => p1.ang < p2.ang ? -1 : 1);

    const uniqVecVisibilityPolygonPoints = [];
    for (let i = 0; i < this.vecVisibilityPolygonPoints.length - 1; i++) {
      const prev = this.vecVisibilityPolygonPoints[i - 1];
      const current = this.vecVisibilityPolygonPoints[i];
      let next = this.vecVisibilityPolygonPoints[i + 1];

      uniqVecVisibilityPolygonPoints.push(current);

      let isClosePoint = Math.abs(current.x - next.x) < joinPointsDistance && Math.abs(current.y - next.y) < joinPointsDistance;
      while (next && isClosePoint) {
        i++;
        next = this.vecVisibilityPolygonPoints[i + 1];
        isClosePoint = next && Math.abs(current.x - next.x) < joinPointsDistance && Math.abs(current.y - next.y) < joinPointsDistance;
      }

      let nextPointOnCurrentLine = prev && current && next && getDistanceFrom2DPointToLine(next.x, next.y, prev.x, prev.y, current.x, current.y) <= joinPointsDistance;
      while (nextPointOnCurrentLine) {
        current.x = next.x;
        current.y = next.y;
        i++;
        next = this.vecVisibilityPolygonPoints[i + 1];
        nextPointOnCurrentLine = prev && current && next && getDistanceFrom2DPointToLine(next.x, next.y, prev.x, prev.y, current.x, current.y) <= joinPointsDistance;
      }
    }
    this.vecVisibilityPolygonPoints = uniqVecVisibilityPolygonPoints;

    // add last segment
    this.vecVisibilityPolygonPoints.push({
      x: this.vecVisibilityPolygonPoints[0].x,
      y: this.vecVisibilityPolygonPoints[0].y,
      ang: this.vecVisibilityPolygonPoints[0].ang + Math.PI * 2
    });

    this.fillLightMap(ox, oy);
  }

  private fillLightMap(ox: number, oy: number) {
    this.lightMap.clean();
    const mapStartX = ox - this.radius;
    const mapStartY = oy - this.radius;

    const radiusInLightMap = this.lightMap.scaledWidth / 2;

    for (let i = 0; i < this.vecVisibilityPolygonPoints.length - 1; i++) {
      const current = this.vecVisibilityPolygonPoints[i];
      const next = this.vecVisibilityPolygonPoints[i + 1];

      const minX = Math.floor((Math.min(ox, current.x, next.x) - mapStartX) * this.lightMap.scale);
      const minY = Math.floor((Math.min(oy, current.y, next.y) - mapStartY) * this.lightMap.scale);
      const maxX = Math.floor((Math.max(ox, current.x, next.x) - mapStartX) * this.lightMap.scale - eps);
      const maxY = Math.floor((Math.max(oy, current.y, next.y) - mapStartY) * this.lightMap.scale - eps);


      for (let x = minX; x <= maxX; x++) {
        for (let y = minY; y <= maxY; y++) {
          if (this.lightMap.getScaled(x, y) > 0) continue;
          const isPointInTriangle = is2DPointInTriangle(
              x + 0.5,
              y + 0.5,
              radiusInLightMap,
              radiusInLightMap,
              (current.x - mapStartX) * this.lightMap.scale,
              (current.y - mapStartY) * this.lightMap.scale,
              (next.x - mapStartX) * this.lightMap.scale,
              (next.y - mapStartY) * this.lightMap.scale
          );
          if (isPointInTriangle) {
            this.lightMap.setScaled(
                x,
                y,
                1 -
                getMagnitude(x + 0.5, y + 0.5, radiusInLightMap, radiusInLightMap) /
                ( radiusInLightMap + 1 )
            )
          }

          const isInSquare = isSquareIntersectTriangle(
              x,
              y,
              1,
              radiusInLightMap,
              radiusInLightMap,
              (current.x - mapStartX) * this.lightMap.scale,
              (current.y - mapStartY) * this.lightMap.scale,
              (next.x - mapStartX) * this.lightMap.scale,
              (next.y - mapStartY) * this.lightMap.scale
          );

          if (isInSquare) {
            this.lightMap.setScaled(
                x,
                y,
                1 -
                getMagnitude(x + 0.5, y + 0.5, radiusInLightMap, radiusInLightMap) /
                ( radiusInLightMap + 1)
            )
          }
        }
      }
    }
  }

  private castLightRay(ox: number, oy: number, ang: number, distance: number) {
    const rdx = distance * Math.cos(ang);
    const rdy = distance * Math.sin(ang);


    const closestPoint = {
      ang: ang,
      x: ox + rdx,
      y: oy + rdy,
      magnitude: distance
    };
    const pointAfterClosest = {
      ang: ang,
      x: ox + rdx,
      y: oy + rdy,
      magnitude: distance
    };

    for (let i = 0; i < this.vecEdges.length - 1; i += 4) {
      const sx = this.vecEdges[i];
      const sy = this.vecEdges[i + 1];
      const ex = this.vecEdges[i + 2];
      const ey = this.vecEdges[i + 3];

      const bothOfEdgePointsOutOfDistance = distToSegment( ox, oy, sx, sy, ex, ey) > distance;
      if (bothOfEdgePointsOutOfDistance) continue;

      const intersection = getLineIntersectPoint(sx, sy, ex, ey, ox, oy, ox + rdx, oy + rdy);
      if (!intersection) continue;

      const magnitude = getMagnitude(intersection.x, intersection.y, ox, oy);
      if (magnitude < closestPoint.magnitude) {
        pointAfterClosest.magnitude = closestPoint.magnitude;
        pointAfterClosest.ang = closestPoint.ang;
        pointAfterClosest.x = closestPoint.x;
        pointAfterClosest.y = closestPoint.y;

        closestPoint.magnitude = magnitude;
        closestPoint.ang = Math.atan2(intersection.y - oy, intersection.x - ox);
        closestPoint.x = intersection.x;
        closestPoint.y = intersection.y;
      } else if (magnitude < pointAfterClosest.magnitude) {
        pointAfterClosest.magnitude = magnitude;
        pointAfterClosest.ang = Math.atan2(intersection.y - oy, intersection.x - ox);
        pointAfterClosest.x = intersection.x;
        pointAfterClosest.y = intersection.y;
      }
    }

    const offsetPart = this.bendOffset;
    return {
      ang: closestPoint.ang,
      x: ( pointAfterClosest.x - closestPoint.x ) * offsetPart + closestPoint.x,
      y: ( pointAfterClosest.y - closestPoint.y ) * offsetPart + closestPoint.y,
      magnitude: ( pointAfterClosest.magnitude - closestPoint.magnitude ) * offsetPart
    };
  }

  checkPointInBoundingBox(x: number, y: number) {
    return (
        (x - eps) < this.boundingBox.sx ||
        (x + eps) > this.boundingBox.ex ||
        (y - eps) < this.boundingBox.sy ||
        (y + eps) > this.boundingBox.ey
    )  }

  getLightLevelInPoint(x: number, y: number) {
    if (this.checkPointInBoundingBox(x, y)) return 0;
    return this.lightMap.getInPercents(
        (x - this.boundingBox.sx) / this.lightMap.width,
        (y - this.boundingBox.sy) / this.lightMap.height
    );
  }
}

function getMagnitude(sx: number, sy: number, ex: number, ey: number) {
  return Math.sqrt(Math.pow(sx - ex, 2) + Math.pow(sy - ey, 2));
}

function getLineIntersectPoint(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) return false;
  const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  if (denominator === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return false;
  return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) };
}

function isLinesHasIntersections(x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) {
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) return false;
  const denominator = ((y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1))
  if (denominator === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator
  return !(ua < 0 || ua > 1 || ub < 0 || ub > 1);
}

function dist2(x: number, y: number, x2: number, y2: number) {
  return Math.pow(x - x2, 2) + Math.pow(y - y2, 2)
}

function distToSegment(x: number, y: number, sx: number, sy: number, ex: number, ey: number) {
  const l2 = dist2(sx, sy, ex, ey);
  if (l2 === 0) return getMagnitude(x, y, sx, sy);
  let t = ((x - sx) * (ex - sx) + (y - sy) * (ey - sy)) / l2;
  t = Math.max(0, Math.min(1, t));
  return getMagnitude(x, y, sx + t * (ex - sx), sy + t * (ey - sy));
}

function getDistanceFrom2DPointToLine(pointX: number, pointY: number, pointOnLineX: number, pointOnLineY: number, anotherPointOnLineX: number, anotherPointOnLineY: number) {
  const A = anotherPointOnLineY - pointOnLineY;
  const B = pointOnLineX - anotherPointOnLineX;
  const C = anotherPointOnLineX * pointOnLineY - pointOnLineX * anotherPointOnLineY;
  return Math.abs(A * pointX + B * pointY + C) / Math.sqrt(A * A + B * B);
}

function is2DPointInTriangle(pointX: number, pointY: number, triangleP1x: number, triangleP1y: number, triangleP2x: number, triangleP2y: number, triangleP3x: number, triangleP3y: number) {
  const a = (triangleP1x - pointX) * (triangleP2y - triangleP1y) - (triangleP2x - triangleP1x) * (triangleP1y - pointY);
  const b = (triangleP2x - pointX) * (triangleP3y - triangleP2y) - (triangleP3x - triangleP2x) * (triangleP2y - pointY);
  const c = (triangleP3x - pointX) * (triangleP1y - triangleP3y) - (triangleP1x - triangleP3x) * (triangleP3y - pointY);
  return  (a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0);
}

function isSquareIntersectTriangle(
    sx: number, sy: number, sSize: number,
    t1x: number, t1y: number, t2x: number, t2y: number, t3x: number, t3y: number
) {
  return (
      isLinesHasIntersections(sx, sy, sx + sSize, sy, t1x, t1y, t2x, t2y) ||
      isLinesHasIntersections(sx + sSize, sy, sx + sSize, sy + sSize, t2x, t2y, t3x, t3y) ||
      isLinesHasIntersections(sx + sSize, sy + sSize, sx, sy + sSize, t3x, t3y, t1x, t1y) ||
      isLinesHasIntersections(sx, sy + sSize, sx, sy, t1x, t1y, t2x, t2y) ||
      isLinesHasIntersections(sx, sy, sx + sSize, sy, t2x, t2y, t3x, t3y) ||
      isLinesHasIntersections(sx, sy, sx + sSize, sy + sSize, t3x, t3y, t1x, t1y) ||
      isLinesHasIntersections(sx + sSize, sy, sx + sSize, sy + sSize, t1x, t1y, t2x, t2y) ||
      isLinesHasIntersections(sx + sSize, sy + sSize, sx, sy + sSize, t2x, t2y, t3x, t3y) ||
      isLinesHasIntersections(sx + sSize, sy + sSize, sx, sy, t3x, t3y, t1x, t1y)
  );
}

export default class LightSystem extends System {
  public readonly componentsRequired = new Set([LightComponent]);
  private lastUpdateTime = 0;
  private updatePerSecond = 30;
  private quality = 20;
  private globalLightLevel = 0.1;
  private lightBias = 0.01;
  private existedLights = new Set<Entity>();
  private listOfLightnings: {
    entity: number;
    cmp: LightComponent,
    lightCasting: LightCasting2D,
    pos: Vector2D,
  }[]  = [];

  start(): void {
    this.ecs.onComponentAdd(LightComponent, (entity) => {
      const light = this.ecs.getComponents(entity).get(LightComponent);
      const pos = this.ecs.getComponents(entity).get(PositionComponent);
      this.listOfLightnings.push({
        entity,
        cmp: light,
        lightCasting: new LightCasting2D(light.distance, this.quality),
        pos
      });
      this.existedLights.add(entity);
    })
    this.ecs.onComponentRemove(LightComponent, (entity) => {
      this.existedLights.delete(entity);
      this.listOfLightnings = this.listOfLightnings.filter(lightCastingInstance => lightCastingInstance.entity !== entity);
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
        pos
      });
      this.existedLights.add(entity);
    }

    // delete old entities
    this.listOfLightnings = this.listOfLightnings.filter(lightCastingInstance => entities.has(lightCastingInstance.entity));

    if (Date.now() - this.lastUpdateTime > 1000 / this.updatePerSecond) {
      this.lastUpdateTime = Date.now();

      for (let i = 0; i < this.listOfLightnings.length; i++) {
        this.listOfLightnings[i].pos = this.ecs.getComponents(this.listOfLightnings[i].entity).get(PositionComponent);
        this.updateLight(this.listOfLightnings[i].lightCasting, this.ecs.getComponents(this.listOfLightnings[i].entity));
      }
    }
  }

  updateLight(lightCastingInstance: LightCasting2D, container: ComponentContainer) {

    const lightCmp = container.get(LightComponent);
    if (!lightCmp.isStaticLight || lightCastingInstance.worldEdges.length === 0) {
      const renderSystem = this.ecs.getSystem(RenderSystem)!;

      const map = this.ecs.getSystem(MapTextureSystem)!.textureMap;
      lightCastingInstance.vecEdges = map.toArray().flatMap(el => el.flatMap(mapEntity => {
        if (!mapEntity) return [];
        const renderer = renderSystem.mapEntityRenders.find(render => render.canRender(mapEntity!));
        if (!renderer) return [];
        return renderer.getArmature(mapEntity);
      }));
    }
    if (!lightCmp.isStaticLight || lightCastingInstance.vecVisibilityPolygonPoints.length === 0) {
      const positionCmp = container.get(PositionComponent);
      lightCastingInstance.calculateVisibilityPolygon(positionCmp.x, positionCmp.y);
    }
  }


  getLightingLevelForPoint(x: number, y: number) {
    let finalLightLevel = this.globalLightLevel;
    for (let i = 0; i < this.listOfLightnings.length; i++) {
      const val = this.listOfLightnings[i];
      const lightPower =  val.lightCasting.getLightLevelInPoint(
          x + (val.pos.x - x) * this.lightBias,
          y + (val.pos.y - y) * this.lightBias
      );
      const lightLevel = val.cmp.brightness * val.cmp.lightFn(lightPower)
      finalLightLevel += lightLevel;
    }
    return finalLightLevel;
  }
}
