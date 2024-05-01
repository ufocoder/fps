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

    const introScene = new TitleScene(container, [
      'Level 1', 
      'press any key'
    ]);


    const gameScene = new LevelScene({ 
      container,
      level,
      soundManager,
      textureManager
    });

    const winScene = new TitleScene(container, [
      'You win'
    ]);
    
    introScene.render();
    introScene.onComplete(() => {
      introScene.destroy()
      soundManager.play('background');
  
      gameScene.run();
    });

    gameScene.onComplete(() => {
      soundManager.pause('background');
      gameScene.destroy();
      winScene.render();
    })
  
  } catch (err) {
    console.warn(err);
  }
};
