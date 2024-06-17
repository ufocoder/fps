import { Component } from "src/lib/ecs/Component";

export default class TimerComponent implements Component {
    public availableTime: number;
    public timeLeft: number;
    public isActive = false;

    public constructor(availableTime: number, isActive: boolean) {
        this.availableTime = availableTime;
        this.timeLeft = availableTime;
        this.isActive = isActive;
    }

    start() {
        this.isActive = true;
    }

    pause() {
        this.isActive = false;
    }

    stop() {
        this.isActive = false;
        this.timeLeft = this.availableTime;
    }
}
