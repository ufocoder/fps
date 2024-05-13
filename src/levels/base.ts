import { Color } from "src/managers/TextureManager";

const random = (from: number, to: number) => {
  return from + Math.random() * (to - from);
};

const generateEnemies = (limit: number) => {
  return new Array(limit).fill(0).map(() => ({
      x: random(2, 4),
      y: random(3, 8),
      angle: 45,
      health: 100,
      sprite: "soldier",
      radius: 0.4,
  }))
}

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
    x: 0,
    y: 5.5,
    angle: 0,
    health: 100,
  },
  enemies: generateEnemies(10)
    /*
  [
    {
      x: 3,
      y: 4.5,
      angle: 45,
      health: 100,
      sprite: "soldier",
      radius: 0.4,
    },
  ]*/
  ,
  exit: {
    x: 4,
    y: 5,
  },
};

export default level;
