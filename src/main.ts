import level from "./lib/level.ts";
import * as presets from "./lib/presets.ts";

import * as player from "./lib/player.js";
import ScreenView from "./lib/views/screen.ts";
import MinimapView from "./lib/views/minimap.ts";
import SoundManager from "./lib/managers/SoundManager.ts";
import TextureManager from "./lib/managers/TextureManager.ts";


const soundManager = new SoundManager();
const textureManager = new TextureManager();

const minimap = new MinimapView(level, player.player);
const screen = new ScreenView(level, player.player, textureManager);

// loop

let isRunning: boolean = false;
let previousTime: number;

function play() {
  previousTime = performance.now();
  isRunning = true;

  function loop() {
    if (!isRunning) {
      return;
    }
    const currentTime = performance.now();
    const dt = (currentTime - previousTime) / 1000;

    player.update(dt, level.map);

    screen.render();
    minimap.render();

    previousTime = currentTime;

    requestAnimationFrame(loop);
  }

  requestAnimationFrame(loop);
}

function pause() {
  isRunning = false;
}

// handlers

window.onload = async () => {
  try {
    await Promise.all([
      await soundManager.load(presets.sounds),
      await textureManager.load(presets.textures),
    ]);
    document.body.appendChild(minimap.canvas.element);
    document.body.appendChild(screen.canvas.element);

    play();
  } catch (err) {
    console.warn(err);
  }
};

window.onclick = function () {
  if (!isRunning) {
    pause();
  } else {
    play();
  }
};

window.addEventListener("blur", () => {
  if (isRunning) {
    return;
  }
  pause();
  screen.renderFocusLost();
});

window.addEventListener("focus", () => {
  if (!isRunning) {
    return;
  }
  play();
});
