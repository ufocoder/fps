import Canvas from "src/lib/Canvas";
import TextureManager from "src/managers/TextureManager";
import { degreeToRadians } from "src/lib/utils";
import Player from "src/entities/Player";

export default class Firstperson {
    readonly level: Level;
    readonly player: Player;
    readonly canvas: Canvas;
    readonly width: number = 640;
    readonly height: number = 480;
    readonly textureManager: TextureManager;

    constructor(level: Level, player: Player, textureManager: TextureManager) {
        this.level = level;
        this.player = player;
        this.textureManager = textureManager;

        this.canvas = new Canvas({
            height: this.height, 
            width: this.width,
            // scale: data.screen.scale,
            style: "border: 1px solid black",
        });
    }

    _rayCasting() {
        const player = this.player;
        const width = this.width;
        const halfHeight = this.height / 2;
        const incrementAngle =  player.fov / width;
        const precision = 100;
        const wallTexture = this.textureManager.get('wall');
        const floorTexture = this.textureManager.get('floor');

        let rayAngle = player.angle - player.fov / 2;

        for (let rayCount = 0; rayCount < width; rayCount++) {
            const ray = {
                x: player.x,
                y: player.y,
            };
    
            // Ray path incrementers
            const cosineIncrement = Math.cos(degreeToRadians(rayAngle)) / precision;
            const sinusIncrement = Math.sin(degreeToRadians(rayAngle)) / precision;
    
            // Wall finder
            let wall = 0;

            while (wall == 0) {
                ray.x += cosineIncrement;
                ray.y += sinusIncrement;
                wall = this.level.map[Math.floor(ray.y)][Math.floor(ray.x)];
            }
    
            // Pythagoras theorem
            let distance = Math.sqrt(
                Math.pow(player.x - ray.x, 2) + 
                Math.pow(player.y - ray.y, 2)
            );
    
            // Fish eye fix
            distance = distance * Math.cos(degreeToRadians(rayAngle - player.angle));
    
            // Wall height
            const wallHeight = Math.floor(halfHeight / distance);
    
            // Draw
            this.canvas.drawVerticalLine({
                x: rayCount, 
                y1: 0, 
                y2: halfHeight - wallHeight, 
                color: this.level.world.top,
            });
            

            if (wall) {
                this._drawTexture({
                    x: rayCount,
                    texture: wallTexture,
                    ray,
                    wallHeight
                });
            }

            this._drawFloor({
                x: rayCount,
                texture: floorTexture,
                wallHeight,
                rayAngle,
            });

            rayAngle += incrementAngle;
        }
    }

    _drawTexture({
        x,
        ray,
        texture, 
        wallHeight
    }: {
        x: number;
        texture: Texture;

        ray: { x: number; y: number; }
        wallHeight: number;
    }) {
        const texturePositionX = Math.floor((texture.width * (ray.x + ray.y)) % texture.width);
        const yIncrementer = (wallHeight * 2) / texture.height;
        let y = this.height / 2 - wallHeight;

        for(let i = 0; i < texture.height; i++) {
            this.canvas.drawVerticalLine({ 
                x: x, 
                y1: y, 
                y2: y + (yIncrementer + 0.5) + 1,
                color: texture.colors[i][texturePositionX],
            })
            y += yIncrementer;
        }
    }

    _drawFloor({
        x,
        texture,
        wallHeight,
        rayAngle 
    }: {
        x: number,
        texture: Texture,
        wallHeight: number,
        rayAngle: number
    }) {
        const halfHeight = this.height / 2;

        const start = halfHeight + wallHeight + 1;
        const directionCos = Math.cos(degreeToRadians(rayAngle));
        const directionSin = Math.sin(degreeToRadians(rayAngle));
        for (let y = start; y < this.height; y++) {
            // Create distance and calculate it
            let distance = this.height / (2 * y - this.height);
            distance = distance / Math.cos(degreeToRadians(this.player.angle) - degreeToRadians(rayAngle)); // Inverse fisheye fix

            // Get the tile position
            let tileX = distance * directionCos;
            let tileY = distance * directionSin;
            tileX += this.player.x;
            tileY += this.player.y;

            // Define texture coords
            const textureX = Math.floor(tileX * texture.width) % texture.width;
            const textureY = Math.floor(tileY * texture.height) % texture.height;

            // Get pixel color
            const color = texture.colors[textureX][textureY];
            this.canvas.drawPixel({ x, y, color });
        }
    }

    renderFocusLost() {
        this.canvas.drawBackground('rgba(0,0,0,0.5)');
        this.canvas.drawText({
            y: this.height / 2,
            x: this.width / 2,
            align: 'center',
            text: 'CLICK TO FOCUS', 
            color: 'white', 
            font: '20px Lucida Console'
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

