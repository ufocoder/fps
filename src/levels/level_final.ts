import { generateAmmo, generateCircle, generateTank, generateZombie, generateZombies } from "./generators";

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: 'zombie-world-alex-besss',
  map: [
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 1],
    [1, 0, 1, 1, 0, 0, 0, 0, 0, 1, 1, 0, 1],
    [1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
  ],
  textures: {
    1: "TECH_1C",
    2: "TECH_1E",
    3: "TECH_2F",
    4: "DOOR_1A",
    5: "DOOR_1E",
  },
  player: {
    x: 6.5,
    y: 6.5,
    angle: 90,
    health: 100,
  },
  items: [
    generateAmmo(3.5, 3.5, 15),
    generateAmmo(3.5, 9.5, 15),
    generateAmmo(9.5, 3.5, 15),
    generateAmmo(9.5, 9.5, 15),
    ...generateCircle(6.5, 6.5, 3.5, 4).map(([x, y]) => generateAmmo(x, y, 15)),
  ],
  enemies: [
    ...generateZombies(3, 4, 4, 0.5, 0.5, 8),
    ...generateZombies(3, 4, 8, 0.5, 0.5, 8),
    ...generateZombies(3, 8, 4, 0.5, 0.5, 8),
    ...generateZombies(3, 8, 8, 0.5, 0.5, 8),
    ...generateCircle(6.5, 6.5, 3.5, 10).map(([x, y]) => generateZombie(x, y, 10)),
    generateTank(2, 2, 6),
    generateTank(2, 8, 6),
    generateTank(8, 2, 6),
    generateTank(8, 8, 6),
  ],
  endingScenario: {
    name: 'enemy',
  },
};

export default level;
