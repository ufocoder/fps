export default interface BaseScene {
    playerState: PlayerState;
    onComplete(cb: () => void): void;
    start(): void;
    destroy(): void;
}