import { degreeToRadians } from "src/lib/utils";

const random = (from: number, to: number) => {
  return from + Math.random() * (to - from);
};

export const generateAmmo = (x: number, y: number, value: number) =>
  ({ 
    type: 'ammo',
    radius: 0.3,
    x,
    y,
    value,
  }) as Item;

export const generateHealthPack = (x: number, y: number, value: number) =>
  ({ 
    type: 'health_pack',
    radius: 0.3,
    x,
    y,
    value,
  }) as Item;

export const generateEntities =
  <T>(generator: (x: number, y: number, ai: number) => T) =>
  (limit: number, x: number, y: number, dx: number, dy: number, ai: number = 0) => {
    return new Array(limit)
      .fill(0)
      .map(() => generator(
        random(x - dx, x + dx), 
        random(y - dy, y + dy), 
        ai
      ));
  };

export const generateCircle = (x: number, y: number, radius: number, total: number): number[][] => {
  const step = 360 / total;
  const coords = [];

  for (let angle = 0; angle < 360; angle += step) {
    coords.push([
      x + radius * Math.cos(degreeToRadians(angle)),
      y + radius * Math.sin(degreeToRadians(angle))
    ]);
  }

  return coords;
  
}

export const generateZombie = (x: number, y: number, ai: number = 0) =>
  ({
    type: "zombie",
    attack: 5,
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
    attack: 5,
    ai,
    x,
    y,
  }) as Enemy;

export const generateSoldier = (x: number, y: number, ai: number = 0) =>
  ({
    type: "soldier",
    health: 200,
    radius: 0.4,
    attack: 10,
    ai,
    x,
    y,
  }) as Enemy;

export const generateCommando = (x: number, y: number, ai: number = 0) =>
  ({
    type: "commando",
    health: 500,
    attack: 15,
    radius: 0.6,
    ai,
    x,
    y,
  }) as Enemy;

export const generateTank = (x: number, y: number, ai: number = 0) =>
  ({
    type: "tank",
    health: 2000,
    attack: 25,
    radius: 0.4,
    ai,
    x,
    y,
  }) as Enemy;

export const generateZombies = generateEntities(generateZombie);
export const generateSoldiers = generateEntities(generateSoldier);
export const generateCommandos = generateEntities(generateCommando);
export const generateFlygies = generateEntities(generateFlyguy);
export const generateTanks = generateEntities(generateTank);
