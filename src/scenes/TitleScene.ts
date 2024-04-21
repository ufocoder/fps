import TextContent from "src/views/TextContent";
import BaseScene from "./BaseScene";

export default class TitleScene implements BaseScene {
    protected readonly view: TextContent;
    protected onCompleteCallback?: () => void;

    constructor(container: HTMLElement, text: string[]) {
        this.view = new TextContent(text);
        this.createListeners();

        container.appendChild(this.view.canvas.element);
    }

    onComplete(cb: () => void): void {
        this.onCompleteCallback = cb;
    }

    render() {
        this.view.render();
    }

    destroy() {
        this.destroyListeners()
        this.view.canvas.element.remove();
    }

    createListeners() {
        document.addEventListener('keydown', this.handleDocumentKeydown);
        document.addEventListener('pointerdown', this.handleDocumentClick);
    }

    destroyListeners() {
        document.removeEventListener('keydown', this.handleDocumentKeydown);
        document.removeEventListener('pointerdown', this.handleDocumentClick);
    }

    handleDocumentKeydown = () => {
        if (this.onCompleteCallback) {
            window.requestAnimationFrame(this.onCompleteCallback);
        }
    }
    
    handleDocumentClick = () => {
        if (this.onCompleteCallback) {
            window.requestAnimationFrame(this.onCompleteCallback);
        }
    }
}