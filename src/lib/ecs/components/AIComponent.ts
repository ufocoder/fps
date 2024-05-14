import { Component } from "src/lib/ecs/Component";

export default class AIComponent implements Component {
    distance: number;
    lastAttackTime: number = 0;
    moveSpeed: number = 0.25;
    damagePerSecond: number = 5;

    constructor(distance: number) {
        this.distance = distance;
    }
}
