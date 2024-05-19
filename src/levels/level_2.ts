const random = (from: number, to: number) => {
  return from + Math.random() * (to - from);
};


const generateZombies = (limit: number, x: number, y: number, dx: number, dy: number) => {
  return new Array(limit).fill(0).map(() => generateZobie(
    random(x - dx, x + dx),
    random(y - dy, y + dy),
  ));
};


const generateZobie = (x: number, y: number) => ({
  x,
  y,
  angle: 45,
  health: 100,
  sprite: "zombie",
  radius: 0.4,
  ai: true,
});

const level: Level = {
  world: {
    colors: {
      top: { r: 0, g: 0, b: 0, a: 255 },
      bottom: { r: 84, g: 98, b: 92, a: 255 },
    },
  },
  music: 'zombie-world-alex-besss',
  map: [
    [1, 5, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 4, 1],
    [1, 0, 1, 0, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 4],
    [1, 0, 1, 0, 0, 2, 1, 0, 0, 1, 0, 1, 0, 2, 1, 1, 0, 0, 0, 1, 0, 2, 2, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 2, 2, 0, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 2, 2, 1],
    [1, 0, 1, 0, 0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1],
    [1, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 2, 1, 1, 2, 2, 0, 1],
    [1, 0, 2, 0, 0, 1, 0, 0, 0, 2, 0, 2, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1],
    [1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 2, 1, 1, 1, 1, 1, 1],
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
    y: 1.5,
    angle: 90,
    health: 100,
  },
  enemies: [
    generateZobie(1.5, 9.5),

    generateZobie(4.5, 6.5),
    generateZobie(4.5, 7.5),
    generateZobie(4.5, 8.5),
    generateZobie(4.5, 9.5),
    generateZobie(4.5, 10.5),
    generateZobie(7, 3.5),
    generateZobie(7, 5.5),
    generateZobie(7, 7.5),
    generateZobie(7, 9.5),
    generateZobie(7, 9.5),
    generateZobie(10.5, 7.5),
    generateZobie(10.5, 9.5),
    generateZobie(12.5, 7.5),
    generateZobie(12.5, 9.5),
    generateZobie(14.5, 7.5),
    generateZobie(14.5, 8.5),
    generateZobie(14.5, 9.5),
    generateZobie(18.5, 1.5),
    generateZobie(18.5, 2.5),
    generateZobie(18.5, 3.5),
    generateZobie(18.5, 4.5),
    ...generateZombies(5, 14.5, 4.5, 1, 1),
    ...generateZombies(15, 18, 5, 1, 1),
    ...generateZombies(15, 17, 7, 1, 1),
  ],
  exit: {
    x: 22,
    y: 1,
  },
};

export default level;
