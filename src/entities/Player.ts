import { degreeToRadians } from "src/lib/utils.ts";

const keyCodes = {
    up: "KeyW",
    down: "KeyS",
    left: "KeyA",
    right: "KeyD",
}

export default class Player {
    readonly map: LevelMap;

    x: number;
    y: number;
    angle: number;

    radius: number = 0.5;
    fov: number = 60;

    moveSpeed: number = 2;
    rotationSpeed: number = 36;

    direction = {
        up: false,
        down: false,
        left: false,
        right: false,
    };

    constructor(level: Level) {
        this.map = level.map;
        this.x = level.player.x;
        this.y = level.player.y;
        this.angle = level.player.angle;
    }

    update(dt: number) {
        this.rotate(dt);
        this.move(dt);
    }

    protected rotate(dt: number) {
        let k = 0

        if (this.direction.right) {
            k = 1;
        }

        if (this.direction.left) {
            k = -1;
        }

        if (k) {
            this.angle = this.angle + k * this.rotationSpeed * dt;
            this.angle %= 360;
        }
    }

    protected move(dt: number) {
        let k = 0
    
        if (this.direction.up) {
            k = 1;
        }
    
        if (this.direction.down) {
            k = -1;
        }
    
        if (k) {
            const playerCos = Math.cos(degreeToRadians(this.angle));
            const playerSin = Math.sin(degreeToRadians(this.angle));
            const newX = this.x + k * playerCos * this.moveSpeed * dt;
            const newY = this.y + k * playerSin * this.moveSpeed * dt;
            const checkX = Math.floor(newX + k * playerCos * this.radius);
            const checkY = Math.floor(newY + k * playerSin * this.radius);
    
            if (this.map[checkY][checkX] == 0) {
                this.y = newY;
                this.x = newX;
            } 
        }
    }

    activateDirectionByKeyCode = (keyCode: string) => {
        if (keyCode === keyCodes.up) {
            this.direction.up = true;
        }
        if (keyCode === keyCodes.down) {
            this.direction.down = true;
        }
        if (keyCode === keyCodes.left) {
            this.direction.left = true;
        }
        if (keyCode === keyCodes.right) {
            this.direction.right = true;
        }
    };

    deactivateDirectionByKeyCode = (keyCode: string) => {
        if (keyCode === keyCodes.up) {
            this.direction.up = false;
        }
        if (keyCode === keyCodes.down) {
            this.direction.down = false;
        }
        if (keyCode === keyCodes.left) {
            this.direction.left = false;
        }
        if (keyCode === keyCodes.right) {
            this.direction.right = false;
        }
    };
}
