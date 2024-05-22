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
    moveSpeed: number = 2;
    mainDirection: MainDirection;
    sideDirection: SideDirection;

    constructor(
        moveSpeed: number = 0, 
        mainDirection: MainDirection = MainDirection.None,
        sideDirection: SideDirection = SideDirection.None,
    ) {
        this.moveSpeed = moveSpeed;
        this.mainDirection = mainDirection;
        this.sideDirection = sideDirection;
    }
}
