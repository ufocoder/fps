export function degreeToRadians(degree: number) {
  return ((degree * Math.PI) / 180) % (2 * Math.PI);
}

export function radiansToDegrees(radians: number) {
  return (180 * radians) / Math.PI;
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
  const angleRadians = Math.atan2(y2 - y1, x2 - x1);
  const angleDegrees = angleRadians * (180 / Math.PI);

  return angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;
}

export function normalizeAngle(a: number) {
  return (a + 360) % 360;
}

export function normalizeAngleInRad(a: number) {
  return (a + 2 * Math.PI) % (2 * Math.PI);
}
