import { degreeToRadians } from "src/lib/utils/angle";

const random = (from: number, to: number) => {
  return from + Math.random() * (to - from);
};

export const generateEntities =
  <T>(generator: (x: number, y: number, ai: number) => T) =>
  (
    limit: number,
    x: number,
    y: number,
    dx: number,
    dy: number,
    ai: number = 0,
  ) => {
    return new Array(limit)
      .fill(0)
      .map(() => generator(random(x - dx, x + dx), random(y - dy, y + dy), ai));
  };

export const generateCircle = (
  x: number,
  y: number,
  radius: number,
  total: number,
): number[][] => {
  const step = 360 / total;
  const coords = [];

  for (let angle = 0; angle < 360; angle += step) {
    coords.push([
      x + radius * Math.cos(degreeToRadians(angle)),
      y + radius * Math.sin(degreeToRadians(angle)),
    ]);
  }

  return coords;
};

export const generateZombie = (x: number, y: number, aiDistance: number = 0) =>
  ({
    x,
    y,
    aiDistance,
    type: "zombie",
    health: 100,
    radius: 0.4,
    meleeWeapon: {
      damage: 5,
      frequency: 1_000,
    },
  }) as Enemy;

export const generateFlyguy = (x: number, y: number, aiDistance: number = 0) =>
  ({
    x,
    y,
    aiDistance,
    type: "flyguy",
    health: 150,
    radius: 0.4,
    rangeWeapon: {
      bulletSprite: "pistol_bullet",
      bulletDamage: 5,
      bulletSpeed: 8,
      attackDistance: 2,
      attackFrequency: 1_000,
    },
  }) as Enemy;

export const generateSoldier = (x: number, y: number, aiDistance: number = 0) =>
  ({
    x,
    y,
    aiDistance,
    type: "soldier",
    health: 200,
    radius: 0.4,
    rangeWeapon: {
      bulletSprite: "shotgun_bullet",
      bulletDamage: 10,
      bulletSpeed: 6,
      attackDistance: 2,
      attackFrequency: 1_500,
    },
  }) as Enemy;

export const generateCommando = (
  x: number,
  y: number,
  aiDistance: number = 0,
) =>
  ({
    x,
    y,
    aiDistance,
    type: "commando",
    health: 500,
    radius: 0.6,
    rangeWeapon: {
      bulletSprite: "shotgun_bullet",
      bulletDamage: 15,
      bulletSpeed: 7,
      attackDistance: 3,
      attackFrequency: 1_500,
    },
  }) as Enemy;

export const generateTank = (x: number, y: number, aiDistance: number = 0) =>
  ({
    x,
    y,
    aiDistance,
    type: "tank",
    health: 2000,
    radius: 0.4,
    rangeWeapon: {
      bulletSprite: "shotgun_bullet",
      bulletDamage: 25,
      bulletSpeed: 5,
      attackDistance: 3,
      attackFrequency: 750,
    },
  }) as Enemy;

export const generateZombies = generateEntities(generateZombie);
export const generateSoldiers = generateEntities(generateSoldier);
export const generateCommandos = generateEntities(generateCommando);
export const generateFlygies = generateEntities(generateFlyguy);
export const generateTanks = generateEntities(generateTank);
