import Canvas from "../canvas.js";
import { Level } from "../level.ts";
import { Texture } from "../textures.ts";
import { degreeToRadians } from "../utils.ts";

type Player = any;

export default class Screen {
    readonly level: Level;
    readonly player: Player;
    readonly canvas: Canvas;
    readonly width: number = 640;
    readonly height: number = 480;
    readonly textures: Texture[] = [];

    constructor(level: Level, player: Player, textures: Texture[]) {
        this.level = level;
        this.player = player;
        this.textures = textures;

        this.canvas = new Canvas({
            height: this.height, 
            width: this.width,
            // scale: data.screen.scale,
            style: "border: 1px solid black",
        });
    }

    _rayCasting() {
        const player = this.player;
        const height = this.height;
        const width = this.width;
        const halfHeight = this.height / 2;
        const incrementAngle =  player.fov / width;
        const precision = 100;

        let rayAngle = player.angle - player.fov / 2;
    
        for (let rayCount = 0; rayCount < width; rayCount++) {
    
            // Ray data
            let rayX = player.x;
            let rayY = player.y;
    
            // Ray path incrementers
            const cosineIncrement = Math.cos(degreeToRadians(rayAngle)) / precision;
            const sinusIncrement = Math.sin(degreeToRadians(rayAngle)) / precision;
    
            // Wall finder
            let wall = 0;
            while (wall == 0) {
                rayX += cosineIncrement;
                rayY += sinusIncrement;
                wall = this.level.map[Math.floor(rayY)][Math.floor(rayX)];
            }
    
            // Pythagoras theorem
            let distance = Math.sqrt(
                Math.pow(player.x - rayX, 2) + 
                Math.pow(player.y - rayY, 2)
            );
    
            // Fish eye fix
            distance = distance * Math.cos(degreeToRadians(rayAngle - player.angle));
    
            // Wall height
            const wallHeight = Math.floor(halfHeight / distance);
            const texture = this.textures[wall - 1];
    
            // Draw
            this.canvas.drawLine({
                x1: rayCount, 
                y1: 0, 
                x2: rayCount,
                y2: halfHeight - wallHeight, 
                color: this.level.world.top,
            });

            if (texture) {
                this._drawTexture({
                    x: rayCount,
                    texture,
                    texturePositionX: Math.floor((texture.width * (rayX + rayY)) % texture.width),
                    wallHeight
                });
            }

            this.canvas.drawLine({
                x1: rayCount, 
                y1: halfHeight + wallHeight, 
                x2: rayCount, 
                y2: height, 
                color: this.level.world.bottom,
            });

            rayAngle += incrementAngle;
        }
    }

    _drawTexture({
        x,
        texture, 
        texturePositionX,
        wallHeight
    }: {
        x: number;
        texture: Texture;
        texturePositionX: number
        wallHeight: number;
    }) {
        let yIncrementer = (wallHeight * 2) / texture.height;
        let y = this.height / 2 - wallHeight;

        for(let i = 0; i < texture.height; i++) {
            this.canvas.drawLine({ 
                x1: x, 
                y1: y, 
                x2: x, 
                y2: y + (yIncrementer + 0.5),
                color: texture.colors[texture.bitmap[i][texturePositionX]],
            })
            y += yIncrementer;
        }
    }

    renderFocusLost() {
        this.canvas.drawBackground('rgba(0,0,0,0.5)');
        this.canvas.drawText({
            text: 'CLICK TO FOCUS', 
            color: 'white', 
            font: '10px Lucida Console'
        });
    }

    render() {
        this.canvas.clear();
        this._rayCasting()
    }

    clear() {
        this.canvas.clear();
    } 
}

