import { Component } from "src/lib/ecs/Component";

export default class AnimatedSpriteComponent implements Component {

    states: Record<string, TextureBitmap[]> = {};
    currentState: string;
    currentFrame: number;
    sprite: TextureBitmap;
    animationSpeed: number = 0.2;
    timeSinceLastFrame: number = 0;

    constructor(initialState: string, states: Record<string, TextureBitmap[]>) {
        this.states = states;
        this.currentFrame = 0;
        this.currentState = initialState;
        this.sprite = states[initialState][0];
    }

    // @TODO: improve
    update(dt: number) {
        const frames = this.states[this.currentState];
        this.timeSinceLastFrame += dt;

        if (this.timeSinceLastFrame > this.animationSpeed) {
            this.currentFrame = (this.currentFrame + 1) % frames.length;
            this.sprite = frames[this.currentFrame];
            this.timeSinceLastFrame = 0;
        }
    }

    switchState(stateName: string) {
        if (stateName in this.states) {
            this.currentState = stateName;
        }
    }
}
