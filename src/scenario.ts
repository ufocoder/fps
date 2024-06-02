import levels from "./levels";
import AnimationManager from "./managers/AnimationManager";
import SoundManager from "./managers/SoundManager";
import TextureManager from "./managers/TextureManager";

import LevelScene from "./scenes/LevelScene";
import TitleScene from "./scenes/TitleScene";

interface ScenarioProps {
  container: HTMLElement;
  soundManager: SoundManager;
  textureManager: TextureManager;
  animationManager: AnimationManager;
}

export function createScenario({
  container,
  soundManager,
  textureManager,
  animationManager,
}: ScenarioProps) {
  let levelIndex = 0;

  const showFinalScene = () => {
    const scene = new TitleScene(container, "Congratulation!", ["You saved the world from zombies"]);
    scene.start();
  };

  const showFailedScene = () => {
    const scene = new TitleScene(container, "You died");
    scene.start();
  };

  const switchToLevelNextScene = () => {
    const level = levels[levelIndex];

    if (!level) {
      showFinalScene();
      return;
    }

    levelIndex++;

    const scene = new LevelScene({
      level,
      container,
      soundManager,
      textureManager,
      animationManager,
    });

    scene.onComplete(() => {
      if (level.music) {
        soundManager.pauseBackground();
      }
      scene.destroy();
      switchToLevelNextScene();
    });

    scene.onFailed(() => {
      if (level.music) {
        soundManager.pauseBackground();
      }
      scene.destroy();
      showFailedScene();
    });

    scene.start();

    if (level.music) {
      soundManager.playBackground(level.music);
    }
  };

  const startScene = new TitleScene(container, "Shoot or run", 
    [
      "Use WASD and mouse to play", 
      "Use M to mute", 
      "",
      "Press any key to start"
    ]);

  startScene.onComplete(() => {
    startScene.destroy();
    switchToLevelNextScene();
  });

  startScene.start();
}
