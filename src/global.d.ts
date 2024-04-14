type LevelMap = number[][];

interface Level {
    map: LevelMap;
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
        top: string;
        bottom: string;
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
    colors: string[][];
}