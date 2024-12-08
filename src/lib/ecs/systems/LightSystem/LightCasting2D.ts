import {
  is2DPointInTriangle,
  distToSegment,
  getDistance,
  getDistanceFrom2DPointToLine,
  getLineIntersectPoint,
  isSquareIntersectTriangle,
} from "src/lib/utils/geometry.ts";
import { ScaledMap } from "src/lib/ecs/lib/ScaledMap.ts";

const eps = 0.0001;

/** ArmatureEdge = [sx1, sy1, ex1, ey1, sx2, sy2, ex2, ey2...] */
export type ArmatureEdge = number[];

export class LightCasting2D {
  public radius: number;
  public vecEdges: ArmatureEdge = [];
  public vecVisibilityPolygonPoints: { x: number; y: number; ang: number }[];
  public world: boolean[];
  public worldEdges: { edge_id: number[]; edge_exist: boolean[] }[];
  public lightMap: ScaledMap;
  public emitterPosition: { x: number; y: number };
  private boundingBox: { ex: number; ey: number; sx: number; sy: number };
  private readonly bendOffset: number;

  constructor(radius: number, quality = 20, bendOffset = 0) {
    this.radius = radius;
    this.vecEdges = [];
    this.vecVisibilityPolygonPoints = [];
    this.lightMap = new ScaledMap(radius * 2, radius * 2, quality);
    this.world = [];
    this.worldEdges = [];
    this.emitterPosition = { x: 0, y: 0 };
    this.boundingBox = { ex: 0, ey: 0, sx: 0, sy: 0 };
    this.bendOffset = bendOffset;
  }

  calculateVisibilityPolygon(ox: number, oy: number) {
    this.emitterPosition = { x: ox, y: oy };

    this.boundingBox = {
      sx: this.emitterPosition.x - this.radius,
      sy: this.emitterPosition.y - this.radius,
      ex: this.emitterPosition.x + this.radius,
      ey: this.emitterPosition.y + this.radius,
    };

    this.vecVisibilityPolygonPoints = [];

    const countRadialRays = 40;
    const pointToLineDistance = 0.01;
    const joinPointsDistance = 0.01;

    for (let i = 0; i <= countRadialRays; i++) {
      const ang = -Math.PI + (i * Math.PI * 2) / countRadialRays;
      const current = this.castLightRay(ox, oy, ang, this.radius);

      const prev2 =
        this.vecVisibilityPolygonPoints[
          this.vecVisibilityPolygonPoints.length - 2
        ];
      const prev =
        this.vecVisibilityPolygonPoints[
          this.vecVisibilityPolygonPoints.length - 1
        ];

      if (
        prev2 &&
        prev &&
        getDistanceFrom2DPointToLine(
          current.x,
          current.y,
          prev2.x,
          prev2.y,
          prev.x,
          prev.y,
        ) <= pointToLineDistance
      ) {
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

      const bothOfEdgePointsOutOfDistance =
        distToSegment(ox, oy, sx, sy, ex, ey) > this.radius;
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

          const vec = this.castLightRay(ox, oy, ang, this.radius);
          this.vecVisibilityPolygonPoints.push(vec);
        }
      }
    }

    this.vecVisibilityPolygonPoints.sort((p1, p2) =>
      p1.ang < p2.ang ? -1 : 1,
    );

    const uniqVecVisibilityPolygonPoints = [];
    for (let i = 0; i < this.vecVisibilityPolygonPoints.length - 1; i++) {
      const prev = this.vecVisibilityPolygonPoints[i - 1];
      const current = this.vecVisibilityPolygonPoints[i];
      let next = this.vecVisibilityPolygonPoints[i + 1];

      uniqVecVisibilityPolygonPoints.push(current);

      let isClosePoint =
        Math.abs(current.x - next.x) < joinPointsDistance &&
        Math.abs(current.y - next.y) < joinPointsDistance;
      while (next && isClosePoint) {
        i++;
        next = this.vecVisibilityPolygonPoints[i + 1];
        isClosePoint =
          next &&
          Math.abs(current.x - next.x) < joinPointsDistance &&
          Math.abs(current.y - next.y) < joinPointsDistance;
      }

      let nextPointOnCurrentLine =
        prev &&
        current &&
        next &&
        getDistanceFrom2DPointToLine(
          next.x,
          next.y,
          prev.x,
          prev.y,
          current.x,
          current.y,
        ) <= joinPointsDistance;
      while (nextPointOnCurrentLine) {
        current.x = next.x;
        current.y = next.y;
        i++;
        next = this.vecVisibilityPolygonPoints[i + 1];
        nextPointOnCurrentLine =
          prev &&
          current &&
          next &&
          getDistanceFrom2DPointToLine(
            next.x,
            next.y,
            prev.x,
            prev.y,
            current.x,
            current.y,
          ) <= joinPointsDistance;
      }
    }
    this.vecVisibilityPolygonPoints = uniqVecVisibilityPolygonPoints;

    // add last segment
    this.vecVisibilityPolygonPoints.push({
      x: this.vecVisibilityPolygonPoints[0].x,
      y: this.vecVisibilityPolygonPoints[0].y,
      ang: this.vecVisibilityPolygonPoints[0].ang + Math.PI * 2,
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

      const minX = Math.floor(
        (Math.min(ox, current.x, next.x) - mapStartX) * this.lightMap.scale,
      );
      const minY = Math.floor(
        (Math.min(oy, current.y, next.y) - mapStartY) * this.lightMap.scale,
      );
      const maxX = Math.floor(
        (Math.max(ox, current.x, next.x) - mapStartX) * this.lightMap.scale -
          eps,
      );
      const maxY = Math.floor(
        (Math.max(oy, current.y, next.y) - mapStartY) * this.lightMap.scale -
          eps,
      );

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
            (next.y - mapStartY) * this.lightMap.scale,
          );
          if (isPointInTriangle) {
            this.lightMap.setScaled(
              x,
              y,
              1 -
                getDistance(
                  x + 0.5,
                  y + 0.5,
                  radiusInLightMap,
                  radiusInLightMap,
                ) /
                  (radiusInLightMap + 1),
            );
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
            (next.y - mapStartY) * this.lightMap.scale,
          );

          if (isInSquare) {
            this.lightMap.setScaled(
              x,
              y,
              1 -
                getDistance(
                  x + 0.5,
                  y + 0.5,
                  radiusInLightMap,
                  radiusInLightMap,
                ) /
                  (radiusInLightMap + 1),
            );
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
      magnitude: distance,
    };
    const pointAfterClosest = {
      ang: ang,
      x: ox + rdx,
      y: oy + rdy,
      magnitude: distance,
    };

    for (let i = 0; i < this.vecEdges.length - 1; i += 4) {
      const sx = this.vecEdges[i];
      const sy = this.vecEdges[i + 1];
      const ex = this.vecEdges[i + 2];
      const ey = this.vecEdges[i + 3];

      const bothOfEdgePointsOutOfDistance =
        distToSegment(ox, oy, sx, sy, ex, ey) > distance;
      if (bothOfEdgePointsOutOfDistance) continue;

      const intersection = getLineIntersectPoint(
        sx,
        sy,
        ex,
        ey,
        ox,
        oy,
        ox + rdx,
        oy + rdy,
      );
      if (!intersection) continue;

      const magnitude = getDistance(intersection.x, intersection.y, ox, oy);
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
        pointAfterClosest.ang = Math.atan2(
          intersection.y - oy,
          intersection.x - ox,
        );
        pointAfterClosest.x = intersection.x;
        pointAfterClosest.y = intersection.y;
      }
    }

    const offsetPart = this.bendOffset;
    return {
      ang: closestPoint.ang,
      x: (pointAfterClosest.x - closestPoint.x) * offsetPart + closestPoint.x,
      y: (pointAfterClosest.y - closestPoint.y) * offsetPart + closestPoint.y,
      magnitude:
        (pointAfterClosest.magnitude - closestPoint.magnitude) * offsetPart,
    };
  }

  checkPointInBoundingBox(x: number, y: number) {
    const { ex, ey, sx, sy } = this.boundingBox;
    return x - eps < sx || x + eps > ex || y - eps < sy || y + eps > ey;
  }

  getLightLevelInPoint(x: number, y: number) {
    if (this.checkPointInBoundingBox(x, y)) return 0;
    return this.lightMap.getInPercents(
      (x - this.boundingBox.sx) / this.lightMap.width,
      (y - this.boundingBox.sy) / this.lightMap.height,
    );
  }
}
