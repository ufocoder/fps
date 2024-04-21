import { Color } from "src/managers/TextureManager";

interface CanvasProps {
    width: number;
    height: number;
    scale?: number;
    style?: string;
}

interface DrawLineProps {
    x1: number;
    y1: number;
    x2: number;
    y2: number;
    color: string | CanvasGradient | CanvasPattern;
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
    color: string | CanvasGradient | CanvasPattern;
}

interface DrawPixelProps {
    x: number;
    y: number;
    color: Color;
}

interface DrawCircleProps {
    x: number;
    y: number;
    radius: number;
    color: string;
}

interface DrawTextProps {
    x: number;
    y: number;
    align?: CanvasTextAlign;
    text: string;
    font: string;
    color?: string | CanvasGradient | CanvasPattern;
}

export default class BufferCanvas {
    readonly width: number;
    readonly height: number;

    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    imageData: ImageData;
    buffer: Uint8ClampedArray;
    
    constructor({ width, height, style, scale }: CanvasProps) {
        this.width = width;
        this.height = height;

        this.element = document.createElement('canvas');
        this.element.width = width;
        this.element.height = height;

        if (style) {
            this.element.setAttribute('style', style);
        }

        this.context = this.element.getContext('2d')!;
        
        if (scale) {
            this.context.scale(scale, scale);
        }

        // Buffer
        this.imageData = this.context.createImageData(width, height);
        this.buffer = this.imageData.data;
    }

    drawBackground(color: string) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.width, this.height);
    }

    drawPixel({ x, y, color }: DrawPixelProps) {
        const offset = 4 * (Math.floor(x) + Math.floor(y) * this.width);
        this.buffer[offset] = color.r;
        this.buffer[offset + 1] = color.g;
        this.buffer[offset + 2] = color.b;
        this.buffer[offset + 3] = color.a;
    }

    drawVerticalLine({ x, y1, y2, color }: DrawVerticalLineProps) {
        for (let y = y1; y < y2; y++) {
            this.drawPixel({ x, y, color });
        }
    }

    drawLine({ x1, y1, x2, y2, color }: DrawLineProps) {
        this.context.strokeStyle = color;
        this.context.beginPath();
        this.context.moveTo(x1, y1);
        this.context.lineTo(x2, y2);
        this.context.stroke();
    }

    drawRect({ x, y, width, height, color }: DrawRectProps) {
        this.context.fillStyle = color;
        this.context.fillRect(
            x,
            y,
            width,
            height
        );
    }

    drawCircle({ x, y, radius, color }: DrawCircleProps) {
        this.context.beginPath();
        this.context.arc(x, y, radius, 0, 2 * Math.PI);
        this.context.fillStyle = color;
        this.context.fill();
    }

    drawText({ x, y, color, font, text, align }: DrawTextProps) {
        if (align) {
            this.context.textAlign = align;
        }
        if (color) {
            this.context.fillStyle = color;
        }
        this.context.font = font;
        this.context.fillText(text, x, y);
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    renderBuffer() {
        this.context.putImageData(this.imageData, 0, 0);
    }
}