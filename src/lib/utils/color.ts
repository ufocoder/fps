export function overlayColor(
  baseColor: Color,
  overlayColor: Color,
  coverageRatio: number,
): Color {
  if (baseColor.a === 0) {
    return baseColor;
  }

  const invCoverageRatio = 1 - coverageRatio;
  const effectiveAlpha = overlayColor.a * coverageRatio;

  return {
    r: baseColor.r * invCoverageRatio + overlayColor.r * effectiveAlpha,
    g: baseColor.g * invCoverageRatio + overlayColor.g * effectiveAlpha,
    b: baseColor.b * invCoverageRatio + overlayColor.b * effectiveAlpha,
    a: baseColor.a + overlayColor.a * coverageRatio * invCoverageRatio,
  };
}

export function applyBrightness(color: Color, lightLevel?: number) {
  if (lightLevel === undefined) return color;
  return {
    r: Math.min(color.r * lightLevel, 255),
    g: Math.min(color.g * lightLevel, 255),
    b: Math.min(color.b * lightLevel, 255),
    a: color.a,
  };
}
