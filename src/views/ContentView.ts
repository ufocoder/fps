import Canvas from "src/lib/Canvas/DefaultCanvas";

export default class ContentView {
    readonly title: string;
    readonly subtitle: string[];
    readonly canvas: Canvas;
    readonly width: number = 640;
    readonly height: number = 480;

    constructor(title: string, subtitle: string[] = []) {
        this.title = title;
        this.subtitle = subtitle;
        this.canvas = new Canvas({
            id: "content",
            height: this.height, 
            width: this.width,
            style: "border: 1px solid black",
        });
    }

    renderText(y: number, fontSize: number, text: string) {
        this.canvas.drawText({
            x: this.width / 2,
            y,
            align: 'center',
            text, 
            color: 'white', 
            font: `${fontSize}px Lucida Console`
        });
    }

    render() {
        this.canvas.clear();
        this.canvas.drawBackground('black');

        const lineHeight = 40;

        if (this.subtitle?.length) {
            let y = this.height / 2 - lineHeight * this.subtitle.length / 2;
            this.renderText(y, 60, this.title);

            y += lineHeight;
            this.subtitle?.forEach((line) => {
                y += lineHeight;
                this.renderText(y, 30, line)
            });
        } else {
            this.renderText(this.height / 2, 40, this.title)
        }
    }
}

