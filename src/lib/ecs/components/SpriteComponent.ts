import { Component } from "src/lib/ecs/Component";

export default class SpriteComponent implements Component {
    sprite: Sprite;

    constructor(sprite: Sprite) {
        this.sprite = sprite;
    }
}
