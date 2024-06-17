import { Component } from "src/lib/ecs/Component";

export default class SimpleAIComponent implements Component {
    activateDistance: number;
    actionPassedTime: number = Infinity;

    constructor(activateDistance: number) {
        this.activateDistance = activateDistance;
    }
}
