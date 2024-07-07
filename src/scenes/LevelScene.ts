import BaseScene from "./BaseScene";
import ECS from "src/lib/ecs";
import createLoop, { Loop } from "src/lib/loop.ts";
import { createLevelEntities } from "src/lib/scenario";
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
import WeaponSystem from "src/lib/ecs/systems/WeaponSystem";
import MapItemSystem from "src/lib/ecs/systems/MapItemSystem";
import MapPolarSystem from "src/lib/ecs/systems/MapPolarSystem";
import MapTextureSystem from "src/lib/ecs/systems/MapTextureSystem";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import PlayerComponent from "src/lib/ecs/components/PlayerComponent";
import WeaponRangeComponent from "src/lib/ecs/components/WeaponRangeComponent";
import LevelPlayerView from "src/views/LevelPlayerView";
import DoorsSystem from "src/lib/ecs/systems/DoorsSystem.ts";

const KEY_CONTROL_PAUSE = "KeyM";

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

  private playerState: PlayerState;
  private levelPlayerView: LevelPlayerView;
  private soundManager: SoundManager;

  constructor({
    container,
    level,
    soundManager,
    textureManager,
    animationManager,
  }: LevelSceneProps) {
    this.level = level;

    this.playerState = {
      health: level.player.health,
      ammo: undefined,
      timeLeft: level.endingScenario.name === "survive" ? level.endingScenario?.timer : undefined,
      soundMuted: soundManager.checkMuted(),
    }

    this.soundManager = soundManager;
    this.levelPlayerView = new LevelPlayerView(container);

    const ecs = new ECS();

    createLevelEntities(ecs, level, textureManager, animationManager);

    ecs.addSystem(new MapTextureSystem(ecs, level));
    ecs.addSystem(new MapPolarSystem(ecs));
    ecs.addSystem(new MapItemSystem(ecs, animationManager, soundManager));
    ecs.addSystem(new ControlSystem(ecs, container));
    ecs.addSystem(new MoveSystem(ecs));
    ecs.addSystem(new AnimationSystem(ecs));
    ecs.addSystem(new AISystem(ecs, textureManager, soundManager));
    ecs.addSystem(new WeaponSystem(ecs, container, animationManager, textureManager, soundManager));
    ecs.addSystem(new RotateSystem(ecs));
    ecs.addSystem(new DoorsSystem(ecs));
    ecs.addSystem(new RenderSystem(ecs, container, level, textureManager));
    ecs.addSystem(new MinimapSystem(ecs, container, level));

    this.ecs = ecs;
    this.loop = createLoop(this.onTick);
  }

  getPlayerContainer() {
    const [player] = this.ecs.query([PlayerComponent, HealthComponent]);

    if (typeof player === "undefined") {
      return;
    }

    return this.ecs.getComponents(player);
  }

  shouldLevelBeCompleted() {
    const playerContainer = this.getPlayerContainer();

    if (!playerContainer) {
      return false;
    }

    const { endingScenario } = this.level;
    const enemies = this.ecs.query([EnemyComponent, HealthComponent]);

    switch (endingScenario.name) {
      case "exit":
        return (
            Math.floor(playerContainer.get(PositionComponent).x) === endingScenario.position.x &&
            Math.floor(playerContainer.get(PositionComponent).y) === endingScenario.position.y
        );
      case "enemy":
        for (const enemy of enemies) {
          if (this.ecs.getComponents(enemy).get(HealthComponent).current > 0) {
            return false;
          }
        }
        return true;
      case "survive":
        if (this.playerState.timeLeft !== undefined) {
          return this.playerState.timeLeft <= 0;
        }
        return false;
    }
  }

  shouldLevelBeFailed() {
    const playerContainer = this.getPlayerContainer();

    if (!playerContainer) {
      return true;
    }

    return playerContainer.get(HealthComponent).current <= 0;
  }

  onTick = (dt: number) => {
    this.ecs.update(dt);

    this.updatePlayerView(dt);

    if (this.onCompleteCallback && this.shouldLevelBeCompleted()) {
      window.requestAnimationFrame(this.onCompleteCallback);
    }

    if (this.onFailedCallback && this.shouldLevelBeFailed()) {
      window.requestAnimationFrame(this.onFailedCallback);
    }
  };

  updatePlayerView(dt: number) {
    const playerContainer = this.getPlayerContainer();

    if (!playerContainer) {
      return;
    }

    const newHealth = playerContainer.get(HealthComponent).current;
    const newAmmo = playerContainer.get(WeaponRangeComponent)?.bulletTotal || 0;
    const newSoundMuted = this.soundManager.checkMuted();

    let shouldRenderView = false;

    if (this.playerState.timeLeft) {
      shouldRenderView = true;
      this.playerState.timeLeft = Math.max(0, this.playerState.timeLeft - dt);
    }

    if (this.playerState.soundMuted !== newSoundMuted) {
      shouldRenderView = true;
      this.playerState.soundMuted = newSoundMuted;
    }

    if (this.playerState.health !== newHealth) {
      shouldRenderView = true;
      this.playerState.health = newHealth;
    }

    if (this.playerState.ammo !== newAmmo) {
      shouldRenderView = true;
      this.playerState.ammo = newAmmo;
    }

    if (shouldRenderView) {
      this.levelPlayerView.render(this.playerState);
    }
  }

  onComplete = (cb: () => void) => {
    this.onCompleteCallback = cb;
  };

  onFailed = (cb: () => void) => {
    this.onFailedCallback = cb;
  };

  toogleMusicControl() {
    if (this.soundManager.checkMuted()) {
      this.soundManager.unmute();
    } else {
      this.soundManager.mute();
    }
  }

  handleDocumentKeypress = (e: KeyboardEvent) => {
    if (e.code === KEY_CONTROL_PAUSE) {
      this.toogleMusicControl();
    }
  };

  createListeners() {
    document.addEventListener("keypress", this.handleDocumentKeypress);
  }

  destroyListeners() {
    document.removeEventListener("keypress", this.handleDocumentKeypress);
  }

  start() {
    this.startedAt = +new Date();
    this.ecs.start();
    this.loop.play();
    this.levelPlayerView.render(this.playerState);
    this.createListeners();
  }

  destroy() {
    this.loop.pause();
    this.ecs.destroy();
    this.levelPlayerView.destroy();
    this.destroyListeners();
  }
}
