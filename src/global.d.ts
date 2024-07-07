interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

type ItemType = 'health_pack' | 'pistol' | 'ammo'

interface Item {
    x: number;
    y: number;
    type: ItemType;
    radius: number;
    value: number;
}


interface Character {
    x: number;
    y: number;
    angle: number;
    health: number;
}

interface Enemy extends Character {
    type: 'zombie' | 'flyguy' | 'soldier' | 'commando' | 'tank' | 'slayer';
    sprite: string;
    radius: number;
    aiDistance?: number;
    meleeWeapon?: {
        damage: number;
        frequency: number;
    }
    rangeWeapon?: {
        bulletSprite: string;
        bulletTotal: number;
        bulletSpeed: number;
        bulletDamage: number;
        attackDistance: number;
        attackFrequency: number;
    }
}

type LevelMap = number[][];

interface ExitEndingScenario {
    name: 'exit';
    position: {
        x: number;
        y: number;
    }
}

interface EnemyEndingScenario {
    name: 'enemy';
}

interface TimerEndingScenario {
    name: 'survive';
    timer: number;
}

interface Level {
    map: LevelMap;
    textures: Record<number, string>;
    player: Character;
    music?: string;
    enemies?: Enemy[];
    items?: Item[];
    world: {
        colors: {
            top: Color;
            bottom: Color;
        }
    }
    endingScenario: ExitEndingScenario | EnemyEndingScenario | TimerEndingScenario;
}

interface TexturePreset {
    id: string;
    url: string;
}

interface SpritePreset {
    id: string;
    url: string;
}

interface SoundPreset {
    id: string;
    url: string;
    volume?: number;
}

interface AnimationSpritePreset {
    id: string;
    frames: string[]
}

interface TextureBitmap {
    width: number;
    height: number;
    colors: Color[][];
}

interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

type Sprite = Texture

type Vector2D = {
    x: number;
    y: number;
}

type PlayerState = {
    ammo?: number; 
    health: number;
    soundMuted: boolean;
    timeLeft?: number;
  };