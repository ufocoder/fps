import { Component } from "src/lib/ecs/Component";

export default class CollisionComponent implements Component {
    isCollided: boolean;

    constructor(isCollided: boolean = false) {
        this.isCollided = isCollided;
    }
}
