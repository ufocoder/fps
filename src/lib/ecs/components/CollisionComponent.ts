import { Component } from "src/lib/ecs/Component";

export default class CollisionComponent implements Component {
    collidedWith?: string;
    isCollided: boolean = false;
}
