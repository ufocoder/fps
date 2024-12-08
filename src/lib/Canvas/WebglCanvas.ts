import { minmax } from "src/lib/utils/math";
import { createTextureFromBuffer, setupWebGL, WebGLContext } from "./lib/webgl";

interface CanvasProps {
  id?: string;
  width: number;
  height: number;
  style?: string;
}

interface DrawVerticalLineProps {
  x: number;
  y1: number;
  y2: number;
  color: Color;
}

interface DrawRectProps {
  x: number;
  y: number;
  width: number;
  height: number;
  color: Color;
}

interface DrawPixelProps {
  x: number;
  y: number;
  color: Color;
}

interface DrawImageProps {
  x: number;
  y: number;
  texture: TextureBitmap;
}

export default class WebglCanvas {
  width: number;
  height: number;

  element: HTMLCanvasElement;

  protected buffer: Uint8Array;
  protected setup: WebGLContext;

  constructor({ id, width, height, style }: CanvasProps) {
    const canvas = document.createElement("canvas");
    const setup = setupWebGL(canvas, width, height);

    if (!setup) {
      throw new Error("bad setup");
    }

    this.setup = setup;

    this.width = width;
    this.height = height;
    this.element = canvas;
    this.element.width = width;
    this.element.height = height;

    if (id) {
      this.element.id = id;
    }

    if (style) {
      this.element.setAttribute("style", style);
    }

    this.buffer = new Uint8Array(width * height * 4);
  }

  clear() {
    this.setup.gl.clear(0);
    this.buffer.fill(0);
  }

  createBufferSnapshot() {}

  commitBufferSnapshot() {
    const { gl, program, buffers } = this.setup;
    const texture = createTextureFromBuffer(
      gl,
      this.width,
      this.height,
      this.buffer,
    );

    const vertexPosition = gl.getAttribLocation(program, "aVertexPosition");
    const textureCoord = gl.getAttribLocation(program, "aTextureCoord");
    const uSampler = gl.getUniformLocation(program, "uSampler");

    gl.clearColor(0.0, 0.0, 0.0, 1.0);
    gl.clear(gl.COLOR_BUFFER_BIT);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.position);
    gl.vertexAttribPointer(vertexPosition, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(vertexPosition);

    gl.bindBuffer(gl.ARRAY_BUFFER, buffers.textureCoord);
    gl.vertexAttribPointer(textureCoord, 2, gl.FLOAT, false, 0, 0);
    gl.enableVertexAttribArray(textureCoord);

    gl.useProgram(program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, texture);
    gl.uniform1i(uSampler, 0);

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  drawPixel({ x, y, color }: DrawPixelProps) {
    if (color.a === 0) {
      return;
    }
    const offset = 4 * (Math.floor(x) + Math.floor(y) * this.width);

    this.buffer[offset] = color.r;
    this.buffer[offset + 1] = color.g;
    this.buffer[offset + 2] = color.b;
    this.buffer[offset + 3] = color.a;
  }

  drawImage({ x, y, texture }: DrawImageProps) {
    for (let i = 0; i < texture.height; i++) {
      for (let j = 0; j < texture.width; j++) {
        const color = texture.colors[i][j];
        if (color.a !== 0) {
          this.drawPixel({
            x: x + j,
            y: y + i,
            color,
          });
        }
      }
    }
  }

  drawVerticalLine({ x, y1, y2, color }: DrawVerticalLineProps) {
    for (let y = y1; y < y2; y++) {
      this.drawPixel({ x, y, color });
    }
  }

  drawRect({ x, y, width, height, color }: DrawRectProps) {
    const startX = minmax(x, 0, this.width);
    const startY = minmax(y, 0, this.width);
    const limitX = Math.min(this.width, x + width);
    const limitY = Math.min(this.height, y + height);

    for (let i = startX; i < limitX; i++) {
      for (let j = startY; j < limitY; j++) {
        this.drawPixel({
          x: i,
          y: j,
          color,
        });
      }
    }
  }
}
