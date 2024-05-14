export async function extractTextureBitmap(url: string) {
  const image = await loadImage(url);
  const imageData = await extractImageData(image);
  const colors = await extractColors(image.height, image.width, imageData.data);

  return {
    height: image.height,
    width: image.width,
    colors,
  } as TextureBitmap;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
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

async function extractColors(
  height: number,
  width: number,
  imageData: Uint8ClampedArray
) {
  const colors: Color[][] = [];
  for (let y = 0; y < height; y++) {
    const row: Color[] = [];
    for (let x = 0; x < width; x++) {
      const i = x * 4 + y * width * 4;
      row.push({
        r: imageData[i],
        g: imageData[i + 1],
        b: imageData[i + 2],
        a: imageData[i + 3],
      });
    }
    colors.push(row);
  }
  return colors;
}
