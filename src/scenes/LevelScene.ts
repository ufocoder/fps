import createLoop, { Loop } from "src/lib/loop.ts";
import SoundManager from "src/managers/SoundManager";
import TextureManager from "src/managers/TextureManager";
import MinimapSystem from "src/lib/ecs/systems/MinimapSystem";
import ControlSystem from "src/lib/ecs/systems/ControlSystem";
import MoveSystem from "src/lib/ecs/systems/MoveSystem";
import RenderSystem from "src/lib/ecs/systems/RenderSystem";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import BaseScene from "./BaseScene";
import AISystem from "src/lib/ecs/systems/AISystem";
import AnimationManager from "src/managers/AnimationManager";
import AnimationSystem from "src/lib/ecs/systems/AnimationSystem";
import ECS from "src/lib/ecs";
import { createWorld } from "src/lib/world";
import UISystem from "src/lib/ecs/systems/UISystem";
import HealthComponent from "src/lib/ecs/components/HealthComponent";

interface LevelSceneProps {
  container: HTMLElement;
  level: Level;
  soundManager: SoundManager;
  textureManager: TextureManager;
  animationManager: AnimationManager;
}

export default class LevelScene implements BaseScene {
  protected readonly level: Level;
  protected readonly loop: Loop;
  protected onCompleteCallback?: () => void;
  protected onFailedCallback?: () => void;

  protected readonly ecs: ECS;

  constructor({ container, level, soundManager, textureManager, animationManager }: LevelSceneProps) {
    this.level = level;

    const ecs = new ECS();

    ecs.addSystem(new ControlSystem(ecs));
    ecs.addSystem(new AISystem(ecs, level, soundManager));
    ecs.addSystem(new MoveSystem(ecs, level));
    ecs.addSystem(new AnimationSystem(ecs));
    ecs.addSystem(new RenderSystem(ecs, container, level, textureManager));
    ecs.addSystem(new UISystem(ecs, container));
    ecs.addSystem(new MinimapSystem(ecs, container, level));

    createWorld(ecs, level, textureManager, animationManager);

    this.ecs = ecs;
    this.loop = createLoop(this.onTick);
  }

  onTick = (dt: number) => {
    this.ecs.update(dt);

    const [camera] = this.ecs.query([CameraComponent]);

    if (!camera) {
      return
    }
    if (
      this.onCompleteCallback &&
      Math.floor(camera.get(PositionComponent).x) === this.level.exit.x &&
      Math.floor(camera.get(PositionComponent).y) === this.level.exit.y
    ) {
      window.requestAnimationFrame(this.onCompleteCallback);
    }

    if (
      this.onFailedCallback &&
      camera.get(HealthComponent).current <= 0) {
        window.requestAnimationFrame(this.onFailedCallback);
    }
  };

  onComplete = (cb: () => void) => {
    this.onCompleteCallback = cb;
  };

  onFailed = (cb: () => void) => {
    this.onFailedCallback = cb;
  };

  start() {
    this.ecs.start()
    this.loop.play();
  }

  destroy() {
    this.loop.pause();
    this.ecs.destroy();
  }

}
