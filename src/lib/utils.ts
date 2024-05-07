export function degreeToRadians(degree: number) {
    return degree * Math.PI / 180;
}

export function radiansToDegrees(radians: number) {
    return 180 * radians / Math.PI;
}

export function minmax(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

export function calculateAngle(x1: number, y1: number, x2: number, y2: number): number {
    const angleRadians = Math.atan2(y2 - y1, x2 - x1);
    const angleDegrees = angleRadians * (180 / Math.PI);

    return angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;
}
