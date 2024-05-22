import { Component } from "src/lib/ecs/Component";

export default class RotateComponent implements Component {
    rotationSpeed: number;
    rotationFactor: number;
    
    constructor(rotationSpeed = 0) {
        this.rotationSpeed = rotationSpeed;
        this.rotationFactor = 0;
    }
}