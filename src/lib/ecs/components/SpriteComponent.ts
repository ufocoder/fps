import { Component } from "src/lib/ecs/Component";

type Sprite = Texture;

export default class SpriteComponent implements Component {
    sprite: Sprite;

    constructor(sprite: Sprite) {
        this.sprite = sprite;
    }
}
