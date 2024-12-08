import { Component } from "src/lib/ecs/Component";

export default class DoorComponent implements Component {
    isOpened: boolean;
    animationTime: number;
    offset: number = 0;
    isVertical: boolean;

    constructor(isOpened: boolean, isVerticalDoor: boolean) {
        this.isOpened = isOpened;
        this.isVertical = isVerticalDoor;
        this.animationTime = 1;
    }
}
