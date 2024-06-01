import { Component } from "src/lib/ecs/Component";

export default class WeaponComponent implements Component {

    bulletTotal: number = 0
    bulletSpeed: number = 0;
    damage: number = 5;

    frequency: number = 1_000;
    lastActionAt: number = +new Date();

    constructor(bullets: number = 30, damage: number = 15, frequency: number = 1_000) {
        this.bulletTotal = bullets;
        this.bulletSpeed = 10;
        this.damage = damage;
        this.frequency = frequency
    }
}
