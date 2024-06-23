interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface Item {
    x: number;
    y: number;
    type: "health_pack" | "ammo";
    radius: number;
    value: number;
}


interface Сharacter {
    x: number;
    y: number;
    angle: number;
    health: number;
}

interface Enemy extends Сharacter {
    type: 'zombie' | 'flyguy' | 'soldier' | 'commando' | 'tank' | 'slayer';
    sprite: string;
    radius: number;
    aiDistance?: number;
    weapon?: {
        bulletSpriteId: string;
        bulletTotal: number;
        bulletSpeed: number;
        bulletDamage: number;
        attackDistance: number;
        attackFrequency: number;
    }
}

type LevelMap = (number | string)[][];

type Empty = {
    type: 'empty';
}
type Wall = {
    type: 'wall',
    texture: string
}
type Door = {
    type: 'door',
    texture: string
}

type MapEntity = Empty | Wall | Door;

interface Level {
    map: LevelMap;
    mapEntities: Record<number | string, MapEntity>;
    player: Сharacter;
    music?: string;
    enemies?: Enemy[];
    items?: Item[];
    exit?: {
        x: number;
        y: number;
    };
    world: {
        colors: {
            top: Color;
            bottom: Color;
        }
    }
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
