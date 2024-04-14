
export default interface BaseScene {
    onComplete(cb: () => void): void;
    render(container: HTMLElement): void;
    destroy(): void;
}