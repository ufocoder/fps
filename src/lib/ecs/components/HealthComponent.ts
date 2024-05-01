import { Component } from "src/lib/ecs/Component";

export default class HealthComponent implements Component {
    public maximum: number;
    public current: number;

    constructor(maximum: number, current: number) {
        this.maximum = maximum;
        this.current = current;
    }
}
