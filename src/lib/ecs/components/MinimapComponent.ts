import { Component } from "src/lib/ecs/Component";

export default class MinimapComponent implements Component {
    color: string;

    constructor(color: string) {
        this.color = color;
    }
}