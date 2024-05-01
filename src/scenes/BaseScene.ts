export default interface BaseScene {
    onComplete(cb: () => void): void;
    start(): void;
    destroy(): void;
}