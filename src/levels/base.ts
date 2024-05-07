import { Color } from "src/managers/TextureManager";

const level: Level = {
  world: {
    colors: {
      top: new Color(0, 0, 0, 255),
      bottom: new Color(84, 98, 92, 255),
    },
  },
  map: [
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 1, 1, 1, 1, 1, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
  ],
  textures: {
    1: "wall",
    2: "exit",
  },
  player: {
    x: 9.7,
    y: 2.01,
    angle: 180,
    health: 100,
  },
  enemies: [
    {
      x: 4,
      y: 3.5,
      angle: 45,
      health: 100,
      sprite: "soldier",
    },
    {
      x: 4,
      y: 7,
      angle: 45,
      health: 100,
      sprite: "soldier",
    },
  ],
  exit: {
    x: 4,
    y: 5,
  },
};

export default level;
