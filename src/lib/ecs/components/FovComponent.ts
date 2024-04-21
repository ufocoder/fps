import { Component } from "src/lib/ecs/Component";

export default class FieldOfVisionComponent implements Component {
    fov: number;

    constructor(fov: number = 0) {
        this.fov = fov;
    }
}
