import { Component } from "src/lib/ecs/Component";

export default class WeaponComponent implements Component {
    damage: number = 5;
    frequency: number = 1_000;
    lastActionAt: number = +new Date();
}
