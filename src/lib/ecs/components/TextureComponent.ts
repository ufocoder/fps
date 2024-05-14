import { Component } from "src/lib/ecs/Component";

export default class TextureComponent implements Component {
    texture: TextureBitmap;

    constructor(texture: TextureBitmap) {
        this.texture = texture;
    }
}