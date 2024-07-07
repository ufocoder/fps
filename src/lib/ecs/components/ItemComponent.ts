import { Component } from "src/lib/ecs/Component";

export default class ItemComponent implements Component {
    type: ItemType;
    value: number;

    constructor(type: ItemType, value: number) {
        this.type = type;
        this.value = value;
    }
}
