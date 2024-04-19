import Player from "src/entities/Player";
import Canvas from "src/lib/BufferCanvas";
import { degreeToRadians } from "src/lib/utils";

export default class Minimap {
    readonly scale: number = 10;
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
                if (this.level.map[y][x] === 1) {
                    this.drawWall(x, y);
                }

                if (this.level.exit.x === x && this.level.exit.y === y) {
                    this.drawExit(x, y);
                }
            }
        }
    }

    drawWall(x: number, y: number) {
        this.canvas.drawRect({
            x: x * this.scale, 
            y: y * this.scale, 
            width: this.scale, 
            height: this.scale, 
            color: '#ccc'
        });
    }

    drawExit(x: number, y: number) {
        this.canvas.drawRect({
            x: x * this.scale, 
            y: y * this.scale, 
            width: this.scale, 
            height: this.scale, 
            color: 'yellow'
        });
    }

    _renderPlayer() {
        this.canvas.drawCircle({
            x: this.player.x * this.scale,
            y: this.player.y * this.scale,
            radius: this.player.radius * this.scale,
            color: 'green'
        });

        const playerAngle = this.player.angle;
        const playerX = this.player.x * this.scale;
        const playerY = this.player.y * this.scale;
        const LINE_SCALE = 15;

        this.canvas.drawLine({
            x1: playerX,
            y1: playerY,
            x2: playerX + Math.cos(degreeToRadians(playerAngle)) * LINE_SCALE,
            y2: playerY + Math.sin(degreeToRadians(playerAngle)) * LINE_SCALE,
            color: 'green'
        });
    }

    render() {
        this.canvas.clear();

        this._renderMap();
        this._renderPlayer();
    }
}
