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
    colors: string[];
}