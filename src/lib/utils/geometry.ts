function distSquare(x: number, y: number, x2: number, y2: number) {
  return Math.pow(x - x2, 2) + Math.pow(y - y2, 2);
}

export function getDistance(sx: number, sy: number, ex: number, ey: number) {
  return Math.sqrt(distSquare(sx, sy, ex, ey));
}

export function getLineIntersectPoint(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
) {
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) return false;
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
  if (ua < 0 || ua > 1 || ub < 0 || ub > 1) return false;
  return { x: x1 + ua * (x2 - x1), y: y1 + ua * (y2 - y1) };
}

export function isLinesHasIntersections(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  x3: number,
  y3: number,
  x4: number,
  y4: number,
) {
  if ((x1 === x2 && y1 === y2) || (x3 === x4 && y3 === y4)) return false;
  const denominator = (y4 - y3) * (x2 - x1) - (x4 - x3) * (y2 - y1);
  if (denominator === 0) return false;
  const ua = ((x4 - x3) * (y1 - y3) - (y4 - y3) * (x1 - x3)) / denominator;
  const ub = ((x2 - x1) * (y1 - y3) - (y2 - y1) * (x1 - x3)) / denominator;
  return !(ua < 0 || ua > 1 || ub < 0 || ub > 1);
}

export function distToSegment(
  x: number,
  y: number,
  sx: number,
  sy: number,
  ex: number,
  ey: number,
) {
  const l2 = distSquare(sx, sy, ex, ey);
  if (l2 === 0) return getDistance(x, y, sx, sy);
  let t = ((x - sx) * (ex - sx) + (y - sy) * (ey - sy)) / l2;
  t = Math.max(0, Math.min(1, t));
  return getDistance(x, y, sx + t * (ex - sx), sy + t * (ey - sy));
}

export function getDistanceFrom2DPointToLine(
  pointX: number,
  pointY: number,
  pointOnLineX: number,
  pointOnLineY: number,
  anotherPointOnLineX: number,
  anotherPointOnLineY: number,
) {
  const A = anotherPointOnLineY - pointOnLineY;
  const B = pointOnLineX - anotherPointOnLineX;
  const C =
    anotherPointOnLineX * pointOnLineY - pointOnLineX * anotherPointOnLineY;
  return Math.abs(A * pointX + B * pointY + C) / Math.sqrt(A * A + B * B);
}

export function is2DPointInTriangle(
  pointX: number,
  pointY: number,
  triangleP1x: number,
  triangleP1y: number,
  triangleP2x: number,
  triangleP2y: number,
  triangleP3x: number,
  triangleP3y: number,
) {
  const a =
    (triangleP1x - pointX) * (triangleP2y - triangleP1y) -
    (triangleP2x - triangleP1x) * (triangleP1y - pointY);
  const b =
    (triangleP2x - pointX) * (triangleP3y - triangleP2y) -
    (triangleP3x - triangleP2x) * (triangleP2y - pointY);
  const c =
    (triangleP3x - pointX) * (triangleP1y - triangleP3y) -
    (triangleP1x - triangleP3x) * (triangleP3y - pointY);
  return (a >= 0 && b >= 0 && c >= 0) || (a <= 0 && b <= 0 && c <= 0);
}

export function isSquareIntersectTriangle(
  sx: number,
  sy: number,
  sSize: number,
  t1x: number,
  t1y: number,
  t2x: number,
  t2y: number,
  t3x: number,
  t3y: number,
) {
  // prettier-ignore
  return (
    isLinesHasIntersections(sx, sy, sx + sSize, sy, t1x, t1y, t2x, t2y) ||
    isLinesHasIntersections(sx + sSize, sy, sx + sSize, sy + sSize, t2x, t2y, t3x, t3y,) ||
    isLinesHasIntersections(sx + sSize, sy + sSize, sx, sy + sSize, t3x, t3y, t1x, t1y,) ||
    isLinesHasIntersections(sx, sy + sSize, sx, sy, t1x, t1y, t2x, t2y) ||
    isLinesHasIntersections(sx, sy, sx + sSize, sy, t2x, t2y, t3x, t3y) ||
    isLinesHasIntersections(sx, sy, sx + sSize, sy + sSize, t3x, t3y, t1x, t1y,) ||
    isLinesHasIntersections(sx + sSize, sy, sx + sSize, sy + sSize, t1x, t1y, t2x, t2y,) ||
    isLinesHasIntersections(sx + sSize, sy + sSize, sx, sy + sSize, t2x, t2y, t3x, t3y,) ||
    isLinesHasIntersections(sx + sSize, sy + sSize, sx, sy, t3x, t3y, t1x, t1y)
  );
}
