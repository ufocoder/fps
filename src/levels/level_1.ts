import { generateAmmo, generateSoldier, generateZombies } from "./generators";

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: 'shocking-red-abbynoise',
  map: [
    ['#', '#', '#', '#', '&', '#', '#', '#', '#', '#', '#', '&', '#', '#', '#', '#', '#', '#', '#', '#'],
    ['#', ' ', ' ', ' ', '&', ' ', ' ', ' ', ' ', ' ', ' ', '&', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '#'],
    ['5', ' ', ' ', ' ', '|', ' ', ' ', '&', ' ', ' ', ' ', '&', ' ', ' ', '&', ' ', ' ', ' ', ' ', '4'],
    ['#', ' ', ' ', ' ', '&', '|', '&', '&', ' ', ' ', ' ', '&', ' ', ' ', '&', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', ' ', '&', ' ', ' ', ' ', ' ', ' ', ' ', '&', ' ', ' ', ' ', ' ', '#'],
    ['#', ' ', ' ', ' ', ' ', ' ', ' ', '&', ' ', ' ', ' ', ' ', ' ', ' ', '&', ' ', ' ', ' ', ' ', '#'],
    ['#', '#', '#', '#', '#', '#', '#', '&', '#', '#', '#', '#', '#', '#', '&', '#', '#', '#', '#', '#'],
  ],
  mapEntities: {
    ' ': { type: 'empty' },
    '#': { type: 'wall', texture: "TECH_1C" },
    '&': { type: 'wall', texture: "TECH_1E" },
    '4': { type: 'wall', texture: "DOOR_1A" },
    '5': { type: 'wall', texture: "DOOR_1E" },
    '|': { type: 'door', texture: "DOOR_1A" },
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
    ...generateZombies(10, 6, 2.5, 0.75, 0.75, 2),
    ...generateZombies(10, 9.5, 4.5, 1, 0.75, 2),
    ...generateZombies(10, 13, 2.5, 0.75, 0.75, 2),
  ],
  endingScenario: {
    name:'exit',
    position: { x: 18, y: 2 }
  },
};

export default level;
