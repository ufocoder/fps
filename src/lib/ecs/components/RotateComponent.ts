import { Component } from "src/lib/ecs/Component";

export default class RotateComponent implements Component {
    rotationDifference: number;
    
    constructor() {
        this.rotationDifference = 0;
    }
}