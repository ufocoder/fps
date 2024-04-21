import createLoop, { Loop } from "src/lib/loop.ts";
import SoundManager from "src/managers/SoundManager";
import TextureManager from "src/managers/TextureManager";
import Entity from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import MinimapSystem from "src/lib/ecs/systems/MinimapSystem";
import ControlSystem from "src/lib/ecs/systems/ControlSystem";
import MoveSystem from "src/lib/ecs/systems/MoveSystem";
import CollisionSystem from "src/lib/ecs/systems/CollisionSystem";
import CameraSystem from "src/lib/ecs/systems/CameraSystem";
import { createEntities } from "src/lib/world";

interface LevelSceneProps {
  container: HTMLElement;
  level: Level;
  soundManager: SoundManager;
  textureManager: TextureManager;
}

export default class LevelScene {
  protected readonly level: Level;
  protected readonly loop: Loop;
  protected onCompleteCallback?: () => void;
  // protected readonly ecs: ECS;
  protected readonly systems: System[];
  protected readonly entities: Entity[];

  constructor({ container, level, textureManager }: LevelSceneProps) {
    this.level = level;
    this.entities = createEntities(level, textureManager);

    this.systems = [
        new ControlSystem(),
        new CollisionSystem(),
        new MoveSystem(),
        new CameraSystem(container, level, textureManager),
        new MinimapSystem(container, level),
    ];
    
    this.loop = createLoop(this.onTick);
  }

  onTick = (dt: number) => {
    this.systems.forEach(system => {
        const entities = this.entities.filter((entity) => (
            system.components.every(component => entity.hasComponent(component))
        ));

        system.update(dt, entities);
    });
    
/*
    if (
      Math.floor(this.player.x) === this.level.exit.x &&
      Math.floor(this.player.y) === this.level.exit.y &&
      this.onCompleteCallback
    ) {
      window.requestAnimationFrame(this.onCompleteCallback);
    }
    */

    // this.camera.render();
    //this.minimap.render();
  };

  onComplete = (cb: () => void) => {
    this.onCompleteCallback = cb;
  };

  run() {
    this.loop.play();
  }

  destroy() {
    // this.destroyListeners();
    this.systems.forEach(system => {
        system.destroy();
    }) 
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
