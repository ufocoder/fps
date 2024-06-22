import { Component } from "src/lib/ecs/Component";

export default class DoorComponent implements Component {
    isOpened: boolean;
    isOpening: boolean;
    isClosing: boolean;
    animationTime: number;
    isVertical: boolean;

    constructor(isOpened: boolean, isVerticalDoor: boolean) {
        this.isOpened = isOpened;
        this.isVertical = isVerticalDoor;
        this.isOpening = false;
        this.isClosing = false;
        this.animationTime = 1;
    }
}
