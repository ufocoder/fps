import { Component } from "src/lib/ecs/Component";

export default class AIComponent implements Component {
    distance: number;

    constructor(distance: number) {
        this.distance = distance;
    }
}
