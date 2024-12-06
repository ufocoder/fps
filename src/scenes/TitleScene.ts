import ContentView from "src/views/ContentView";
import BaseScene from "./BaseScene";

export default class TitleScene implements BaseScene {
    public playerState: PlayerState;

    protected readonly view: ContentView;
    protected readonly container: HTMLElement;
    protected onCompleteCallback?: () => void;

    constructor(container: HTMLElement, playerState: PlayerState, title: string, subtitle?: string[]) {
        this.container = container;
        this.playerState = playerState;
        this.view = new ContentView(title, subtitle);
        this.createListeners();
    }

    onComplete(cb: () => void): void {
        this.onCompleteCallback = cb;
    }

    start() {
        this.container.appendChild(this.view.canvas.element);
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