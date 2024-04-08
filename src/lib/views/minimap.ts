import Canvas from "../canvas.js";
import { Level } from "../level.js";

type Player = any;

export default class Minimap {
    readonly scale: number = 20;
    readonly level: Level;
    readonly player: Player;
    readonly canvas: Canvas;

    constructor(level: Level, player: Player) {
        this.level = level;
        this.player = player;

        const cols = level.map[0].length;
        const rows = level.map.length;

        this.canvas = new Canvas({
            height: rows * this.scale, 
            width: cols * this.scale
        });
    }

    _renderMap() {
        const cols = this.level.map[0].length;
        const rows = this.level.map.length;

        for (let x = 0; x < cols; x++) {
            for (let y = 0; y < rows; y++) {
                if (this.level.map[y][x]) {
                    this.canvas.drawRect({
                        x: x * this.scale, 
                        y: y * this.scale, 
                        width: this.scale, 
                        height: this.scale, 
                        color: 'rgb(200,200,200)'
                    });
                }
            }
        }
    }

    _renderPlayer() {
        this.canvas.drawCircle({
            x: this.player.x * this.scale, 
            y: this.player.y * this.scale, 
            radius: this.player.radius * this.scale, 
            color: 'green'
        });
    }

    render() {
        this.canvas.clear();

        this._renderMap();
        this._renderPlayer();
    }
}
