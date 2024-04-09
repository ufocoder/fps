export class Color {
  r: number;
  g: number;
  b: number;
  a: number;

  constructor(r: number, g: number, b: number, a: number) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }
}

export default class TextureManager {
  private textures: Record<string, Texture> = {};

  async load(presets: TexturePreset[]) {
    await Promise.all(
      presets.map(async (preset) => {
        const { id, url } = preset;
        const image = await loadPresetImage(url);
        const data = await extractImageData(image);
        const colors = await extractColors(data);

        this.textures[id] = {
          id,
          height: image.height,
          width: image.width,
          colors,
        };
      })
    );
  }

  get(id: string) {
    return this.textures[id];
  }
}

async function loadPresetImage(
  url: string
): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const element = document.createElement("img");

    element.src = url;
    element.onerror = () => reject();
    element.onload = () => resolve(element);
  });
}

async function extractImageData(image: HTMLImageElement) {
  const canvas = document.createElement("canvas");
  canvas.width = image.width;
  canvas.height = image.height;

  const context = canvas.getContext("2d")!;

  context.drawImage(image, 0, 0, image.width, image.height);

  return context.getImageData(0, 0, image.width, image.height).data;
}

async function extractColors(imageData: Uint8ClampedArray) {
  const colors = [];

  for (let i = 0; i < imageData.length; i += 4) {
    colors.push(`rgb(${imageData[i]},${imageData[i + 1]},${imageData[i + 2]})`);
  }

  return colors;
}
