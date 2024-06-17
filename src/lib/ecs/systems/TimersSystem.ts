import System from "src/lib/ecs/System";


import LevelComponent from "src/lib/ecs/components/LevelComponent.ts";
import TimerComponent from "src/lib/ecs/components/TimerComponent.ts";

export default class TimersSystem extends System {
    public readonly componentsRequired = new Set([LevelComponent]);

    start(): void {
        const entities = this.ecs.query([TimerComponent]);
        entities.forEach(entity => {
            const timerComponent = this.ecs.getComponents(entity).get(TimerComponent);
            if (timerComponent?.isActive) timerComponent.start();
        })
    }

    update(dt: number) {
        const entities = this.ecs.query([TimerComponent]);
        entities.forEach(entity => {
            const timerComponent = this.ecs.getComponents(entity).get(TimerComponent);
            this.updateTimerCmp(timerComponent, dt);
        });
    }

    updateTimerCmp(cmp: TimerComponent, dt: number) {
        if (!cmp?.isActive) return;
        if (cmp.timeLeft === 0) return;
        cmp.timeLeft = Math.max(0, cmp.timeLeft - dt);
    }

    destroy(): void {}
}
