import Canvas from "src/lib/Canvas";

export default class TextContent {
    readonly text: string[];
    readonly canvas: Canvas;
    readonly width: number = 640;
    readonly height: number = 480;

    constructor(text: string[]) {
        this.text = text;
        this.canvas = new Canvas({
            height: this.height, 
            width: this.width,
            style: "border: 1px solid black",
        });
    }

    render() {
        this.canvas.clear();
        this.canvas.drawBackground('black');
        const lineHeight = 40;
        this.text.forEach((line, index) => {
            this.canvas.drawText({
                x: this.width / 2,
                y: this.height / 2 - lineHeight * (this.text.length / 2 - index - 0.5),
                align: 'center',
                text: line, 
                color: 'white', 
                font: `${lineHeight}px Lucida Console`
            });
        });
    }
}

