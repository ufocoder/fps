import { Component } from "src/lib/ecs/Component";

export default class BulletComponent implements Component {
    fromEntity: number;
    damage: number = 5;
    createdAt: number = +new Date();

    constructor(fromEntity: number, damage: number) {
        this.fromEntity = fromEntity;
        this.damage = damage;
    }
}
