import { Component, ComponentContainer } from "src/lib/ecs/Component";

export default class CollisionComponent implements Component {
    collidedEntity?: ComponentContainer;
    isCollided: boolean = false;
}
