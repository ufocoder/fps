export default class SoundManager {
    private sounds: Record<string, HTMLAudioElement> = {};
    public currentMusic: string = ''

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

    playSound(id: string) {
        const audio = this.sounds[id];
        const copy = audio.cloneNode() as HTMLAudioElement;

        copy.play();
    }

    playBackground(id: string) {
        this.sounds[id].play();
    }

    pauseBackground(id: string) {
        this.sounds[id].pause();
    }

    setCurrentMusic(id: string) {
        this.currentMusic = id;
    }
}