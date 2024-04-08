import level from "./lib/level.ts";
import { textures } from "./lib/textures.ts";

import * as player from "./lib/player.js";
import Screen from "./lib/screen.ts";
import Minimap from "./lib/minimap.ts";

let screen: Screen;
let minimap: Minimap;

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
  minimap = new Minimap(level, player.player);
  screen = new Screen(level, player.player, textures);

  document.body.appendChild(minimap.canvas.element);
  document.body.appendChild(screen.canvas.element);
  play();
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
