import * as presets from "./presets.ts";

import SoundManager from "./managers/SoundManager.ts";
import TextureManager from "./managers/TextureManager.ts";
import AnimationManager from "./managers/AnimationManager.ts";
import { createScenario } from "./scenario.ts"

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

    createScenario({
      container,
      soundManager,
      textureManager,
      animationManager,
    });

  } catch (err) {
    console.warn(err);
  }
};
