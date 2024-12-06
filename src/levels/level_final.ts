import {
  generateCircle,
  generateTank,
  generateZombie,
  generateZombies,
} from "./generators/characters";
import { generatePistolAmmo } from "./generators/items";

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: "zombie-world-alex-besss",
  // prettier-ignore
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
  mapEntities: {
    0: { type: "empty" },
    1: { type: "wall", texture: "TECH_1C" },
    2: { type: "wall", texture: "TECH_1E" },
    3: { type: "wall", texture: "TECH_2F" },
    4: { type: "wall", texture: "DOOR_1A" },
    5: { type: "wall", texture: "DOOR_1E" },
  },
  player: {
    x: 5.5,
    y: 5.5,
    angle: 90,
    health: 100,
  },
  items: [
    generatePistolAmmo(3.5, 3.5, 15),
    generatePistolAmmo(3.5, 9.5, 15),
    generatePistolAmmo(9.5, 3.5, 15),
    generatePistolAmmo(9.5, 9.5, 15),
    ...generateCircle(6.5, 6.5, 3.5, 4).map(([x, y]) =>
      generatePistolAmmo(x, y, 15),
    ),
  ],
  enemies: [
    ...generateZombies(3, 4, 4, 0.5, 0.5, 8),
    ...generateZombies(3, 4, 8, 0.5, 0.5, 8),
    ...generateZombies(3, 8, 4, 0.5, 0.5, 8),
    ...generateZombies(3, 8, 8, 0.5, 0.5, 8),
    ...generateCircle(6.5, 6.5, 3.5, 10).map(([x, y]) =>
      generateZombie(x, y, 10),
    ),
    generateTank(2, 2, 6),
    generateTank(2, 8, 6),
    generateTank(8, 2, 6),
    generateTank(8, 8, 6),
  ],
  endingScenario: {
    name: "survive",
    timer: 30,
  },
};

export default level;
