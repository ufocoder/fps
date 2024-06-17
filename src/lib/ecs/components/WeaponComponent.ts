import { Component } from "src/lib/ecs/Component";

export default class WeaponComponent implements Component {

    bulletSpriteId: string;
    bulletTotal: number;
    bulletSpeed: number;
    bulletDamage: number;

    attackDistance: number;
    attackFrequency: number;
    attackLastTimeAt: number = +new Date();

    constructor(bulletSpriteId: string = '', bulletTotal: number = 30, bulletDamage: number = 15, bulletSpeed: number = 5, attackDistance: number, attackFrequency: number = 1_000) {
        this.bulletSpriteId = bulletSpriteId;
        this.bulletTotal = bulletTotal;
        this.bulletDamage = bulletDamage;
        this.bulletSpeed = bulletSpeed;

        this.attackDistance = attackDistance;
        this.attackFrequency = attackFrequency;
    }
}
