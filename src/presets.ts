export const textures: TexturePreset[] = [
  {
    id: "wall",
    url: "./assets/textures/TECH_1C.PNG",
  },
  {
    id: "wall",
    url: "./assets/textures/TECH_1C.PNG",
  },
  {
    id: "exit",
    url: "./assets/textures/DOOR_1A.PNG",
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
];


export const sounds: SoundPreset[] = [
  {
    id: "background",
    url: "./assets/music/background.mp3",
    volume: 1,
  },
];
