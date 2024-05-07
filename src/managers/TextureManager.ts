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
        const imageData = await extractImageData(image);
        const colors = await extractColors(image.height, image.width, imageData.data);

        this.textures[id] = {
          id,
          imageData,
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

  return context.getImageData(0, 0, image.width, image.height);
}

async function extractColors(height: number, width: number, imageData: Uint8ClampedArray) {
  const colors: Color[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Color[] = [];
    for (let x = 0; x < width; x++) {
      const i = x * 4 + y * width * 4;
      row.push(new Color(imageData[i], imageData[i + 1], imageData[i + 2], imageData[i + 3]));
    }
    colors.push(row);
  }
  return colors;
}
