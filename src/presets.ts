export const textures: TexturePreset[] = [
  {
    id: "TECH_1C",
    url: "./assets/textures/TECH_1C.PNG"
  },
  {
    id: "TECH_1E",
    url: "./assets/textures/TECH_1E.PNG"
  },
  {
    id: "TECH_2F",
    url: "./assets/textures/TECH_2F.PNG"
  },
  {
    id: "TECH_3B",
    url: "./assets/textures/TECH_3B.PNG"
  },
  {
    id: "TECH_4E",
    url: "./assets/textures/TECH_4E.PNG"
  },
  {
      id: "TECH_4F",
      url: "./assets/textures/TECH_4F.PNG",
  },
  {
    id: "DOOR_1A",
    url: "./assets/textures/DOOR_1A.PNG",
  },
  {
    id: "DOOR_1C",
    url: "./assets/textures/DOOR_1C.PNG",
  },
  {
    id: "DOOR_1E",
    url: "./assets/textures/DOOR_1E.PNG",
  },
  {
    id: "floor",
    url: "./assets/textures/FLOOR_1A.PNG",
  }
];

export const sprites: SpritePreset[] = [
  {
    id: "soldier",
    url: "./assets/characters/SoldierIdle.png",
  },
  {
    id: "zombie",
    url: "./assets/characters/ZombieIdle.png"
  }
];
 
export const animation: AnimationSpritePreset[] = [
  {
    id: "zombieIdle",
    frames: [
      "./assets/characters/ZombieIdle.png",
    ],
  },
  {
    id: "zombieWalk",
    frames: [
      "./assets/characters/ZombieWalk1.png",
      "./assets/characters/ZombieWalk2.png",
      "./assets/characters/ZombieWalk3.png",
      "./assets/characters/ZombieWalk4.png",
    ],
  },
  {
    id: "zombieDamage",
    frames: [
      "./assets/characters/ZombieDamage1.png",
      "./assets/characters/ZombieDamage2.png",
    ],
  },
  {
    id: "zombieDeath",
    frames: [
      "./assets/characters/ZombieDeath1.png",
      "./assets/characters/ZombieDeath2.png",
      "./assets/characters/ZombieDeath3.png",
      "./assets/characters/ZombieDeath4.png",
    ],
  },
  {
    id: "zombieAttack",
    frames: [
      "./assets/characters/ZombieAttack1.png",
      "./assets/characters/ZombieAttack2.png",
    ],
  },
  {
    id: "soldierIdle",
    frames: [
      "./assets/characters/SoldierIdle.png",
    ],
  },
  {
    id: "soldierWalk",
    frames: [
      "./assets/characters/SoldierWalk1.png",
      "./assets/characters/SoldierWalk2.png",
      "./assets/characters/SoldierWalk3.png",
      "./assets/characters/SoldierWalk4.png",
    ],
  },
  {
    id: "soldierDamage",
    frames: [
      "./assets/characters/SoldierDamage1.png",
      "./assets/characters/SoldierDamage2.png",
    ],
  },
  {
    id: "soldierDeath",
    frames: [
      "./assets/characters/SoldierDeath1.png",
      "./assets/characters/SoldierDeath2.png",
      "./assets/characters/SoldierDeath3.png",
      "./assets/characters/SoldierDeath4.png",
    ],
  },
  {
    id: "soldierAttack",
    frames: [
      "./assets/characters/SoldierAttack1.png",
      "./assets/characters/SoldierAttack2.png",
    ],
  },
];


export const sounds: SoundPreset[] = [
  {
    id: 'zombie-attack',
    url: "./assets/sounds/zombie-attack.mp3",
    volume: 1,
  },
  {
    id: "dead-lift-yeti",
    url: "./assets/music/dead-lift-yeti.mp3",
    volume: 0.8,
  },
  {
    id: "zombie-world-alex-besss",
    url: "./assets/music/zombie-world-alex-besss.mp3",
    volume: 0.8,
  }
];
