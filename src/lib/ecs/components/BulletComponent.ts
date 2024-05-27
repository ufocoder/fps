import { Component } from "src/lib/ecs/Component";

export default class BulletComponent implements Component {
    damage: number = 5;
    createdAt: number = +new Date();

    constructor(damage: number) {
        this.damage = damage;
    }
}
