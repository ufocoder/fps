import { Component } from "src/lib/ecs/Component";

export default class CircleComponent implements Component {
    radius: number;

    constructor(radius = 0) {
        this.radius = radius;
    }
}
