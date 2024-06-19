import BaseScene from "./BaseScene";
import ECS from "src/lib/ecs/ExtendedECS";
import createLoop, { Loop } from "src/lib/loop.ts";
import { createEntities } from "src/lib/scenario";
import SoundManager from "src/managers/SoundManager";
import AISystem from "src/lib/ecs/systems/AISystem";
import AnimationManager from "src/managers/AnimationManager";
import AnimationSystem from "src/lib/ecs/systems/AnimationSystem";
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
import MapItemSystem from "src/lib/ecs/systems/MapItemSystem";
import MapPolarSystem from "src/lib/ecs/systems/MapPolarSystem";
import MapTextureSystem from "src/lib/ecs/systems/MapTextureSystem";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";

export type LevelState = {
  player: { health: number; };
  timerTimeLeft?: number;
};

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

  private state: LevelState;

  constructor({
    container,
    level,
    soundManager,
    textureManager,
    animationManager,
  }: LevelSceneProps) {
    this.level = level;
    this.state = {
      player: { health: level.player.health },
      timerTimeLeft: level.endingScenario.name === "surviveInTime" ? level.endingScenario?.timer : undefined,
    }

    const ecs = new ECS();

    createEntities(ecs, level, textureManager, animationManager);

    ecs.addSystem(new MapTextureSystem(ecs, level));
    ecs.addSystem(new MapPolarSystem(ecs));
    ecs.addSystem(new MapItemSystem(ecs, soundManager));
    ecs.addSystem(new ControlSystem(ecs, container));
    ecs.addSystem(new MoveSystem(ecs));
    ecs.addSystem(new AnimationSystem(ecs));
    ecs.addSystem(new AISystem(ecs, textureManager, soundManager));
    ecs.addSystem(new WeaponSystem(ecs, container, animationManager, textureManager, soundManager));
    ecs.addSystem(new RotateSystem(ecs));
    ecs.addSystem(new RenderSystem(ecs, container, level, textureManager));
    ecs.addSystem(new MinimapSystem(ecs, container, level));
    ecs.addSystem(new UISystem(ecs, container, soundManager, this.state));

    this.ecs = ecs;
    this.loop = createLoop(this.onTick);
  }

  shouldLevelBeCompleted() {
    const [player] = this.ecs.query([PlayerComponent, PositionComponent]);

    if (typeof player === "undefined") {
      return false;
    }

    const playerContainer = this.ecs.getComponents(player);
    if (!playerContainer) return;

    const enemies = this.ecs.query([EnemyComponent, HealthComponent]);

    const ending = this.level.endingScenario
    switch (ending.name) {
      case "exitPosition":
        return (
            Math.floor(playerContainer.get(PositionComponent).x) ===
            ending.position.x &&
            Math.floor(playerContainer.get(PositionComponent).y) ===
            ending.position.y
        );
      case "killAllEnemy":
        for (const enemy of enemies) {
          if (this.ecs.getComponents(enemy).get(HealthComponent).current > 0) {
            return false;
          }
        }
        return true;
      case "surviveInTime":
        if (this.state.timerTimeLeft !== undefined) {
          return this.state.timerTimeLeft <= 0;
        }
        return false;
      default:
        throw new Error('Unknown ending scenario');
    }
  }

  shouldLevelBeFailed() {
    const [player] = this.ecs.query([PlayerComponent, HealthComponent]);
    if (typeof player === "undefined") {
      return true;
    }

    const playerContainer = this.ecs.getComponents(player);
    if (!playerContainer) return true;

    return playerContainer.get(HealthComponent).current <= 0;
  }

  onTick = (dt: number) => {
    this.updateState(dt);
    this.ecs.update(dt);

    if (this.onCompleteCallback && this.shouldLevelBeCompleted()) {
      window.requestAnimationFrame(this.onCompleteCallback);
    }

    if (this.onFailedCallback && this.shouldLevelBeFailed()) {
      window.requestAnimationFrame(this.onFailedCallback);
    }
  };

  updateState(dt: number) {
    if (this.state.timerTimeLeft !== undefined) {
      this.state.timerTimeLeft = Math.max(0, this.state.timerTimeLeft - dt);
    }
  }

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
