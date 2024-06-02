import BaseScene from "./BaseScene";
import ECS from "src/lib/ecs/ExtendedECS";
import createLoop, { Loop } from "src/lib/loop.ts";
import { createEntities } from "src/lib/scenario";
import SoundManager from "src/managers/SoundManager";
import AISystem from "src/lib/ecs/systems/AISystem";
import AnimationManager from "src/managers/AnimationManager";
import AnimationSystem from "src/lib/ecs/systems/AnimationSystem";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import ControlSystem from "src/lib/ecs/systems/ControlSystem";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import MinimapSystem from "src/lib/ecs/systems/MinimapSystem";
import MoveSystem from "src/lib/ecs/systems/MoveSystem";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import RenderSystem from "src/lib/ecs/systems/RenderSystem";
import RotateSystem from "src/lib/ecs/systems/RotateSystem";
import TextureManager from "src/managers/TextureManager";
import UISystem from "src/lib/ecs/systems/UISystem";
import WeaponSystem from "src/lib/ecs/systems/WeaponSystem";
import MapPolarSystem from "src/lib/ecs/systems/MapPolarSystem";
import MapTextureSystem from "src/lib/ecs/systems/MapTextureSystem";

interface LevelSceneProps {
  container: HTMLElement;
  level: Level;
  soundManager: SoundManager;
  textureManager: TextureManager;
  animationManager: AnimationManager;
}

export default class LevelScene implements BaseScene {

  protected onCompleteCallback?: () => void;
  protected onFailedCallback?: () => void;

  protected readonly level: Level;
  protected readonly loop: Loop;
  protected readonly ecs: ECS;
  protected startedAt: number = +new Date();

  constructor({
    container,
    level,
    soundManager,
    textureManager,
    animationManager,
  }: LevelSceneProps) {
    this.level = level;

    const ecs = new ECS();

    createEntities(ecs, level, textureManager, animationManager);

    ecs.addSystem(new MapTextureSystem(ecs, level));
    ecs.addSystem(new MapPolarSystem(ecs));
    ecs.addSystem(new ControlSystem(ecs, container));
    ecs.addSystem(new WeaponSystem(ecs, soundManager));
    ecs.addSystem(new AISystem(ecs, soundManager));
    ecs.addSystem(new MoveSystem(ecs));
    ecs.addSystem(new RotateSystem(ecs));
    ecs.addSystem(new AnimationSystem(ecs));
    ecs.addSystem(new RenderSystem(ecs, container, level, textureManager));
    ecs.addSystem(new UISystem(ecs, container, soundManager));
    ecs.addSystem(new MinimapSystem(ecs, container, level));

    this.ecs = ecs;
    this.loop = createLoop(this.onTick);
  }

  onTick = (dt: number) => {
    this.ecs.update(dt);

    const [player] = this.ecs.query([CameraComponent]);
    const playerContainer = this.ecs.getComponents(player);

    if (!playerContainer) {
      return;
    }

    if (
      this.onCompleteCallback &&
      Math.floor(playerContainer.get(PositionComponent).x) ===
        this.level.exit.x &&
      Math.floor(playerContainer.get(PositionComponent).y) === this.level.exit.y
    ) {
      window.requestAnimationFrame(this.onCompleteCallback);
    }

    if (
      this.onFailedCallback &&
      playerContainer.get(HealthComponent).current <= 0
    ) {
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
    this.startedAt = +new Date();
    this.ecs.start();
    this.loop.play();
  }

  destroy() {
    this.loop.pause();
    this.ecs.destroy();
  }
}
