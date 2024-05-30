import { Component } from "src/lib/ecs/Component";

export default class AIComponent implements Component {
    damage: number;
    distance: number;
    frequence: number; // seconds
    lastAttackTime: number = 0;

    constructor(distance: number, damage: number, frequence: number = 1_000) {
        this.distance = distance;
        this.damage = damage;
        this.frequence = frequence;
    }
}
