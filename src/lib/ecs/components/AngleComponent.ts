import { Component } from "src/lib/ecs/Component";

export default class AngleComponent implements Component {
    angle: number;

    constructor(angle = 0) {
        this.angle = angle;
    }
}
