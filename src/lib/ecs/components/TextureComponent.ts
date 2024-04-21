import { Component } from "src/lib/ecs/Component";

export default class TextureComponent implements Component {
    texture: Texture;

    constructor(texture: Texture) {
        this.texture = texture;
    }
}