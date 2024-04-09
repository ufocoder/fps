export default class SoundManager {
    private sounds: Record<string, HTMLAudioElement> = {}; 

    async load(presets: SoundPreset[]) {
        await Promise.all(presets.map(preset => new Promise((resolve, reject) => {
            const audio = new Audio(preset.url);

            audio.onload = () => resolve(void 0);
            audio.onabort = () => reject();
            audio.onerror = () => reject();

            audio.load();
            resolve(void 0);

            this.sounds[preset.id] = audio;
        })));
    }

    play(id: string) {
        this.sounds[id].play();
    }

    pause(id: string) {
        this.sounds[id].pause();
    }
}