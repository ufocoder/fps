import { generateSoldier } from "./generators";

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: 'dead-lift-yeti',
  map: [
    [1, 1, 1, 1, 2, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [5, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1],
  ],
  textures: {
    1: "TECH_1C",
    2: "TECH_1E",
    3: "TECH_2F",
    4: "DOOR_1A",
    5: "DOOR_1E",
  },
  player: {
    x: 1.5,
    y: 2.5,
    angle: 0,
    health: 100,
  },
  enemies: [
    generateSoldier(4, 4, 4),
    generateSoldier(4, 4, 4),
  ],
  exit: {
    x: 18,
    y: 2,
  },
};

export default level;
