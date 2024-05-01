import { Component } from "src/lib/ecs/Component";

export default class CameraComponent implements Component {
    fov: number; // FieldOfVisionComponent

    constructor(fov: number = 0) {
        this.fov = fov;
    }
}
