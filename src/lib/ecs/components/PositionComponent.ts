import { Component } from "src/lib/ecs/Component";

export default class PositionComponent implements Component {
    x: number;
    y: number;

    constructor(x = 0, y = 0) {
        this.x = x;
        this.y = y;
    }
}