import { Component } from "src/lib/ecs/Component";

export default class ColorComponent implements Component {
    color: string;

    constructor(color: string) {
        this.color = color;
    }
}