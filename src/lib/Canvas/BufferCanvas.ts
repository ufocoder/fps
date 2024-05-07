import { minmax } from "../utils";

interface CanvasProps {
    width: number;
    height: number;
    scale?: number;
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

export default class BufferCanvas {
    readonly width: number;
    readonly height: number;

    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;

    protected buffer: ImageData;
    
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

        this.buffer = this.context.createImageData(this.width, this.height);
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }

    createBufferSnapshot() {
        this.buffer = this.context.createImageData(this.width, this.height);
    }

    commitBufferSnapshot() {
        this.context.putImageData(this.buffer!, 0, 0);
    }

    drawPixel({ x, y, color }: DrawPixelProps) {
        const offset = 4 * (Math.floor(x) + Math.floor(y) * this.width);

        this.buffer.data[offset] = color.r;
        this.buffer.data[offset + 1] = color.g;
        this.buffer.data[offset + 2] = color.b;
        this.buffer.data[offset + 3] = color.a;
    }

    drawVerticalLine({ x, y1, y2, color }: DrawVerticalLineProps) {
        for (let y = y1; y < y2; y++) {
            this.drawPixel({ x, y, color });
        }
    }

    drawRect({ x, y, width, height, color }: DrawRectProps) {
        const startX = minmax(x, 0, this.width)
        const startY = minmax(y, 0, this.width)
        const limitX = Math.min(this.width, x + width);
        const limitY = Math.min(this.height, y + height);

        for (let i = startX; i < limitX; i++) {
            for (let j = startY; j < limitY; j++) {
                this.drawPixel({
                    x: i,
                    y: j,
                    color,
                })
            }
        }
    }

    drawImage() {
        
    }
}