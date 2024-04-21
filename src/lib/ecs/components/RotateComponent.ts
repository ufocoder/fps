import { Component } from "src/lib/ecs/Component";

export default class RotateComponent implements Component {
    rotationSpeed: number;

    direction = {
        left: false,
        right: false,
    };
    
    constructor(rotationSpeed: number = 0) {
        this.rotationSpeed = rotationSpeed;
    }
}