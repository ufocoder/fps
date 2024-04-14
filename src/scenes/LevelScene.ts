import createLoop, { Loop }  from "src/lib/loop.ts";
import Player from "src/entities/Player.ts";
import FirstpersonView from "src/views/Firstperson.ts";
import MinimapView from "src/views/Minimap.ts";
import SoundManager from "src/managers/SoundManager";
import TextureManager from "src/managers/TextureManager";

interface LevelSceneProps { 
    level: Level;
    soundManager: SoundManager;
    textureManager: TextureManager;
}

export default class LevelScene {
    protected readonly level: Level;
    protected readonly loop: Loop;
    protected readonly player: Player;
    protected readonly minimap: MinimapView;
    protected readonly camera: FirstpersonView;
    protected onCompleteCallback?: () => void;

    constructor ({ level, textureManager }: LevelSceneProps) {
        this.level = level;

        this.player = new Player(level);
        this.minimap = new MinimapView(level, this.player);
        this.camera = new FirstpersonView(level, this.player, textureManager);
    
        this.loop = createLoop(this.onTick);

        this.createListeners();
    }
    
    onTick = (dt: number) => {
        this.player.update(dt);

        if (
            Math.floor(this.player.x) === this.level.exit.x && 
            Math.floor(this.player.y) === this.level.exit.y && 
            this.onCompleteCallback
        ) {    
            this.onCompleteCallback();
        }

        this.camera.render();
        this.minimap.render();
    }

    onComplete = (cb: () => void)  => {
        this.onCompleteCallback = cb;
    }

    render(container: HTMLElement) {
        this.minimap.canvas.element.style.position = 'absolute';
        this.minimap.canvas.element.style.top = '20px';
        this.minimap.canvas.element.style.right = '20px';

        container.appendChild(this.minimap.canvas.element);
        container.appendChild(this.camera.canvas.element);

        this.loop.play();
    }

    destroy() {
        this.destroyListeners()
        this.camera.canvas.element.remove();
        this.minimap.canvas.element.remove();
    }

    createListeners() {
        document.addEventListener('pointerdown', this.handleDocumentPointerdown);
        document.addEventListener('keydown', this.handleDocumentKeyDown);
        document.addEventListener('keyup', this.handleDocumentKeyUp);
        window.addEventListener('blur', this.handleWindowBlur);
    }

    destroyListeners() {
        document.removeEventListener('pointerdown', this.handleDocumentPointerdown);
        document.removeEventListener('keydown', this.handleDocumentKeyDown);
        document.removeEventListener('keyup', this.handleDocumentKeyUp);
        window.removeEventListener('blur', this.handleWindowBlur);
    }

    handleDocumentKeyDown = (e: KeyboardEvent) => {
        this.player.activateDirectionByKeyCode(e.code);
    }

    handleDocumentKeyUp = (e: KeyboardEvent) => {
        this.player.deactivateDirectionByKeyCode(e.code);
    }

    handleDocumentPointerdown = () => {
        if (this.loop.checkRunning()) {
            this.loop.pause();
        } else {
            this.loop.play();
        }
    }

    handleWindowBlur = () => {
        this.camera.renderFocusLost()
        this.loop.pause();
    }
}
