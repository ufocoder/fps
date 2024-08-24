import { generatePistolAmmo, generateFlygies, generateSoldiers, generateZombies } from "./generators";

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: 'heavy-duty-zoo',
  map: [
    [1, 1, 1, 2, 2, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1, 1, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 2, 0, 0, 0, 0, 4],
    [1, 0, 0, 2, 0, 0, 0, 0, 0, 0, 1, 2, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 2, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 2, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1],
  ],
  mapEntities: {
    0: {type:'empty'},
    1: {type:'wall', texture: "TECH_1C" },
    2: {type:'wall', texture: "TECH_1E" },
    3: {type:'wall', texture: "TECH_2F" },
    4: {type:'wall', texture: "DOOR_1A" },
    5: {type:'wall', texture: "DOOR_1E" },
  },
  player: {
    x: 2,
    y: 2.5,
    angle: 90,
    health: 100,
  },
  items: [
    generatePistolAmmo(1.75, 7.5, 15),
    generatePistolAmmo(2, 7.5, 15),
    generatePistolAmmo(2.25, 7.5, 15),
  ],
  enemies: [
    ...generateFlygies(10, 7, 2, 1, 1, 3),
    ...generateZombies(20, 8, 3, 1, 1, 5),
    ...generateSoldiers(20, 8, 8, 1, 1, 5),
  ],
  endingScenario: {
    name:'exit',
    position: {
      x: 18,
      y: 2,
    }
  },
};

export default level;
