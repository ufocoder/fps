
export function applyLight(color: Color, lightLevel?: number) {
    if (lightLevel === undefined) return color;
    return {
        r: Math.min(color.r * lightLevel, 255),
        g: Math.min(color.g * lightLevel, 255),
        b: Math.min(color.b * lightLevel, 255),
        a: color.a
    };
}
