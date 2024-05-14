import { extractTextureBitmap } from "src/lib/image";

export default class AnimationManager {
  private animations: Record<string, TextureBitmap[]> = {};

  async load(presets: AnimationSpritePreset[]) {
    for (const preset of presets) {
      this.animations[preset.id] = await Promise.all(
        preset.frames.map(async url => await extractTextureBitmap(url))
      );
    }
  }

  get(id: string) {
    return this.animations[id];
  }
}
