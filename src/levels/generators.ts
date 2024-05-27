const random = (from: number, to: number) => {
  return from + Math.random() * (to - from);
};

export const generateEntities =
  <T>(generator: (x: number, y: number) => T) =>
  (limit: number, x: number, y: number, dx: number, dy: number, ai: number = 0) => {
    return new Array(limit)
      .fill(0)
      .map(() => generator(random(x - dx, x + dx), random(y - dy, y + dy)), ai);
  };

export const generateZombie = (x: number, y: number, ai: number = 0) =>
  ({
    type: "zombie",
    health: 100,
    radius: 0.4,
    ai,
    x,
    y,
  }) as Enemy;


export const generateFlyguy = (x: number, y: number, ai: number = 0) =>
  ({
    type: "flyguy",
    health: 150,
    radius: 0.4,
    ai,
    x,
    y,
  }) as Enemy;

export const generateSoldier = (x: number, y: number, ai: number = 0) =>
  ({
    type: "soldier",
    health: 200,
    radius: 0.6,
    ai,
    x,
    y,
  }) as Enemy;

export const generateCommando = (x: number, y: number, ai: number = 0) =>
  ({
    type: "commando",
    health: 500,
    radius: 0.6,
    ai,
    x,
    y,
  }) as Enemy;

export const generateTank = (x: number, y: number, ai: number = 0) =>
  ({
    type: "tank",
    health: 2000,
    radius: 0.4,
    ai,
    x,
    y,
  }) as Enemy;

export const generateZombies = generateEntities(generateZombie);
export const generateSoldiers = generateEntities(generateSoldier);
