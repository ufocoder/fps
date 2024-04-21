import { Component } from "src/lib/ecs/Component";

export default class MoveComponent implements Component {
    moveSpeed: number = 2;

    direction = {
        forward: false,
        back: false,
    };

    constructor(moveSpeed: number = 0) {
        this.moveSpeed = moveSpeed;
    }
}