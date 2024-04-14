import level from "./levels/base.ts";
import * as presets from "./presets.ts";

import SoundManager from "./managers/SoundManager.ts";
import TextureManager from "./managers/TextureManager.ts";
import LevelScene from "./scenes/LevelScene.ts";
import TitleScene from "./scenes/TitleScene.ts";

const container = document.getElementById('app')!;
const soundManager = new SoundManager();
const textureManager = new TextureManager();

window.onload = async () => {
  try {
    await Promise.all([
      await soundManager.load(presets.sounds),
      await textureManager.load(presets.textures),
    ]);

    const introScene = new TitleScene([
      'Level 1', 
      'press any key'
    ]);
    const gameScene = new LevelScene({ 
      level,
      soundManager,
      textureManager
    });
    const winScene = new TitleScene([
      'You win'
    ]);

    introScene.render(container);
    introScene.onComplete(() => {
      introScene.destroy()
      gameScene.render(container);
    });

    gameScene.onComplete(() => {
      gameScene.destroy();
      winScene.render(container);
    })
  
  } catch (err) {
    console.warn(err);
  }
};
