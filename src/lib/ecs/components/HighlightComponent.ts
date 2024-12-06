
import { Component } from "src/lib/ecs/Component";

export default class HighlightComponent implements Component {

    color: Color;
    duration: number
    startedAt: number = 0;

    constructor(color: Color, duration: number = 500) {
        this.startedAt = Date.now();
        this.color = color;
        this.duration = duration;
    }
}
