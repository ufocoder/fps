import { generateAmmo, generateSoldier, generateSoldiers, generateZombies } from "./generators";

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: 'shocking-red-abbynoise',
  map: [
    [1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
    [5, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 4],
    [1, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 2, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
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
  items: [
    generateAmmo(3.5, 1.6, 15),
    generateAmmo(3.5, 1.8, 15),
    generateAmmo(3.5, 2, 15),
    generateAmmo(3.5, 2.2, 15),
    generateAmmo(3.5, 2.4, 15),
    generateAmmo(16, 5, 15),
  ],
  enemies: [
    generateSoldier(18, 1.75, 4),
    generateSoldier(18, 3.25, 4),
    ...generateSoldiers(4, 17.5, 4, 1, 1, 4),
    ...generateZombies(10, 6, 2.5, 0.75, 0.75, 2),
    ...generateZombies(10, 9.5, 4.5, 1, 0.75, 2),
    ...generateZombies(10, 13, 2.5, 0.75, 0.75, 2),
  ],
  exit: {
    x: 18,
    y: 2,
  },
};

export default level;
