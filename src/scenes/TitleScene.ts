import TextContent from "src/views/TextContent";
import BaseScene from "./BaseScene";

export default class TitleScene implements BaseScene {
    protected readonly view: TextContent;
    protected onCompleteCallback?: () => void;

    constructor(text: string[]) {
        this.view = new TextContent(text);
        this.createListeners();
    }

    onComplete(cb: () => void): void {
        this.onCompleteCallback = cb;
    }

    render(container: HTMLElement) {
        this.view.render();
        container.appendChild(this.view.canvas.element);
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
            this.onCompleteCallback();
        }
    }
    
    handleDocumentClick = () => {
        if (this.onCompleteCallback) {
            this.onCompleteCallback();
        }
    }
}