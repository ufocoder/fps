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

interface DrawRectProps {
    x: number;
    y: number;
    width: number;
    height: number;
    color: string | CanvasGradient | CanvasPattern;
}

interface DrawCircleProps {
    x: number;
    y: number;
    radius: number;
    color: string;
}

interface DrawTextProps {
    text: string;
    font: string;
    color: string | CanvasGradient | CanvasPattern;
}

export default class Canvas {
    readonly width: number;
    readonly height: number;

    element: HTMLCanvasElement;
    context: CanvasRenderingContext2D;
    
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
    }

    drawBackground(color: string) {
        this.context.fillStyle = color;
        this.context.fillRect(0, 0, this.width, this.height);
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
        this.context.beginPath()
        this.context.arc(x, y, radius, 0, 2 * Math.PI)
        this.context.fillStyle = color;
        this.context.fill()
    }

    drawText({ color, font, text }: DrawTextProps) {
        this.context.fillStyle = color;
        this.context.font = font;
        this.context.fillText(text, 37, this.height / 2);
    }

    clear() {
        this.context.clearRect(0, 0, this.width, this.height);
    }    
}