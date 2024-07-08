import { Component } from "src/lib/ecs/Component";

const lightApplyFn = {
    linear(x: number) {
        return x;
    },
    easeInOutCubic(x: number) {
        return x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;
    },
    easeInQuart(x: number) {
        return x * x * x * x;
    }
}


export default class LightComponent implements Component {
    brightness: number;
    distance: number;
    lightFn: (lightLevel: number) => number;
    isStaticLight = false;

    constructor(distance: number, brightness: number, lightFn: keyof typeof lightApplyFn = 'linear') {
        this.distance = distance;
        this.brightness = brightness;
        this.lightFn = lightApplyFn[lightFn];
    }
}
