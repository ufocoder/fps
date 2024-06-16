import { Component } from "src/lib/ecs/Component";

export enum MainDirection {

    Back = -1,
    None,
    Forward,
}

export enum SideDirection {
    Left = -1,
    None,
    Right
}

export default class MoveComponent implements Component {
    constructor(
        public moveSpeed: number = 0,
        public canSlide: boolean = false,
        public mainDirection: MainDirection = MainDirection.None,
        public sideDirection: SideDirection = SideDirection.None,
    ) {}
}
