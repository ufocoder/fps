import { Component } from "src/lib/ecs/Component";

export default class BoxComponent implements Component {
    size: number;

    constructor(size = 0) {
        this.size = size;
    }
}
