export default class SoundManager {
    protected sounds: Record<string, HTMLAudioElement> = {};
    protected currentBackgroundId: string = ''
    protected isMuted: boolean = false;

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

    checkMuted() {
        return this.isMuted;
    }

    mute() {
        this.isMuted = true;
        this.pauseBackground();
    }

    unmute() {
        this.isMuted = false;
        this.resumeBackground();
    }

    playSound(id: string, volume: number = 1) {
        const audio = this.sounds[id];
        const copy = audio.cloneNode() as HTMLAudioElement;
        
        copy.volume = volume;

        copy.play();
    }

    playBackground(id: string) {
        this.currentBackgroundId = id;
        this.sounds[id].play();
    }

    resumeBackground() {
        if (this.sounds[this.currentBackgroundId]) {
            this.sounds[this.currentBackgroundId].play();
        }
    }

    pauseBackground() {
        if (this.sounds[this.currentBackgroundId]) {
            this.sounds[this.currentBackgroundId].pause();
        }
    }
}