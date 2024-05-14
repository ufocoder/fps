import { extractTextureBitmap } from "src/lib/image";

export default class TextureManager {
  private textures: Record<string, TextureBitmap> = {};

  async load(presets: TexturePreset[]) {
    for (const preset of presets) {
      this.textures[preset.id] = await extractTextureBitmap(preset.url);
    }
  }

  get(id: string) {
    return this.textures[id];
  }
}
