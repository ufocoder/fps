interface Color {
    r: number;
    g: number;
    b: number;
    a: number;
}

type LevelMap = number[][];

interface Level {
    map: LevelMap;
    textures: Record<number, string>;
    player: {
        x: number;
        y: number;
        angle: number;
    };
    exit: {
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

interface SoundPreset {
    id: string;
    url: string;
    volume?: number;
}

interface Texture {
    id: string;
    width: number;
    height: number;
    colors: Color[][];
}