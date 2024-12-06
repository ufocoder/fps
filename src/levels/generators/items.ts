export const generatePistol = (x: number, y: number, value: number) =>
  ({
    type: "pistol_weapon",
    radius: 0.3,
    x,
    y,
    value,
  }) as Item;

export const generatePistolAmmo = (x: number, y: number, value: number) =>
  ({
    type: "pistol_ammo",
    radius: 0.3,
    x,
    y,
    value,
  }) as Item;

export const generateHealthPack = (x: number, y: number, value: number) =>
  ({
    type: "health_pack",
    radius: 0.3,
    x,
    y,
    value,
  }) as Item;
