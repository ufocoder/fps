import createLoop, { Loop } from "src/lib/loop.ts";
import SoundManager from "src/managers/SoundManager";
import TextureManager from "src/managers/TextureManager";
import Entity from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import MinimapSystem from "src/lib/ecs/systems/MinimapSystem";
import ControlSystem from "src/lib/ecs/systems/ControlSystem";
import MoveSystem from "src/lib/ecs/systems/MoveSystem";
import RenderSystem from "src/lib/ecs/systems/RenderSystem";
import { createEntities } from "src/lib/world";
import QuerySystem from "src/lib/ecs/lib/QuerySystem";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import BaseScene from "./BaseScene";
import AISystem from "src/lib/ecs/systems/AISystem";
import AnimationManager from "src/managers/AnimationManager";
import AnimationSystem from "src/lib/ecs/systems/AnimationSystem";

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

  protected readonly querySystem: QuerySystem;
  protected readonly systems: System[];
  protected readonly entities: Entity[];

  constructor({ container, level, textureManager, animationManager }: LevelSceneProps) {
    this.level = level;

    const entities = createEntities(level, textureManager, animationManager);
    const querySystem = new QuerySystem(entities);

    this.systems = [
      new ControlSystem(querySystem),
      new AISystem(querySystem),
      new MoveSystem(querySystem, level),
      new AnimationSystem(querySystem),
      new RenderSystem(querySystem, container, level, textureManager),
      new MinimapSystem(querySystem, container, level),
    ];

    this.entities = entities;
    this.querySystem = querySystem;
    this.loop = createLoop(this.onTick);
  }

  onTick = (dt: number) => {
    this.systems.forEach((system) => {
      system.update(dt, this.querySystem.query(system.requiredComponents));
    });

    const [camera] = this.querySystem.query([CameraComponent]);

    if (
      camera &&
      Math.floor(camera.getComponent(PositionComponent).x) ===
        this.level.exit.x &&
      Math.floor(camera.getComponent(PositionComponent).y) ===
        this.level.exit.y &&
      this.onCompleteCallback
    ) {
      window.requestAnimationFrame(this.onCompleteCallback);
    }
  };

  onComplete = (cb: () => void) => {
    this.onCompleteCallback = cb;
  };

  start() {
    this.systems.forEach((system) => {
      system.start();
    });
    this.loop.play();
  }

  destroy() {
    // this.destroyListeners();
    this.systems.forEach((system) => {
      system.destroy();
    });
  }

  /*
  createListeners() {
    document.addEventListener("pointerdown", this.handleDocumentPointerdown);
    window.addEventListener("blur", this.handleWindowBlur);
  }

  destroyListeners() {
    document.removeEventListener("pointerdown", this.handleDocumentPointerdown);
    window.removeEventListener("blur", this.handleWindowBlur);
  }

  handleDocumentPointerdown = () => {
    if (this.loop.checkRunning()) {
      this.loop.pause();
    } else {
      this.loop.play();
    }
  };
*/
  handleWindowBlur = () => {
    this.loop.pause();
  };
}
