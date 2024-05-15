import level from "./levels/base.ts";
import * as presets from "./presets.ts";

import SoundManager from "./managers/SoundManager.ts";
import TextureManager from "./managers/TextureManager.ts";
import LevelScene from "./scenes/LevelScene.ts";
import TitleScene from "./scenes/TitleScene.ts";
import AnimationManager from "./managers/AnimationManager.ts";

const container = document.getElementById('app')!;
const soundManager = new SoundManager();
const textureManager = new TextureManager();
const animationManager = new AnimationManager();

window.onload = async () => {
  try {
    await Promise.all([
      await soundManager.load(presets.sounds),
      await textureManager.load([...presets.textures, ...presets.sprites]),
      await animationManager.load(presets.animation),
    ]);

    container.innerHTML = '';

    const introScene = new TitleScene(container, [
      'Level 1', 
      'press any key'
    ]);

    const gameScene = new LevelScene({ 
      container,
      level,
      soundManager,
      textureManager,
      animationManager,
    });

    const winScene = new TitleScene(container, [
      'To be continued'
    ]);
    
    introScene.start();

    introScene.onComplete(() => {
      introScene.destroy()
      soundManager.play('background');
  
      gameScene.start();
    });

    gameScene.onComplete(() => {
      soundManager.pause('background');
      gameScene.destroy();
      winScene.start();
    })
  
  } catch (err) {
    console.warn(err);
  }
};
