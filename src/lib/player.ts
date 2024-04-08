import { Map } from "./level.ts";
import { degreeToRadians } from "./utils.ts";

export const player = {
    fov: 60,
    x: 2,
    y: 2,
    angle: 90,
    radius: 0.5,
    speed: {
        movement: 1, // cells per sec
        rotation: 36, // angle per sec
    }
};

const key = {
    up: {
        code: "KeyW",
        active: false
    },
    down: {
        code: "KeyS",
        active: false
    },
    left: {
        code: "KeyA",
        active: false
    },
    right: {
        code: "KeyD",
        active: false
    }
};


function move(dt: number, map: Map) {
    let k = 0

    if (key.up.active) {
        k = 1;
    }

    if (key.down.active) {
        k = -1;
    }

    if (k) {
        const playerCos = Math.cos(degreeToRadians(player.angle));
        const playerSin = Math.sin(degreeToRadians(player.angle));
        const newX = player.x + k * playerCos * player.speed.movement * dt;
        const newY = player.y + k * playerSin * player.speed.movement * dt;
        const checkX = Math.floor(newX + k * playerCos * player.radius);
        const checkY = Math.floor(newY + k * playerSin * player.radius);

        if(map[checkY][checkX] == 0) {
            player.y = newY;
            player.x = newX;
        } 
    }
}

function rotate(dt: number) {
    let k = 0

    if (key.right.active) {
        k = 1;
    }

    if (key.left.active) {
        k = -1;
    }

    if (k) {
        player.angle = player.angle + k * player.speed.rotation * dt;
        player.angle %= 360;
    }
}

export function update(dt: number, map: Map) {
    move(dt, map);
    rotate(dt);
}


/**
 * Key down check
 */
document.addEventListener('keydown', (event) => {
    const keyCode = event.code;

    if (keyCode === key.up.code) {
        key.up.active = true;
    }
    if (keyCode === key.down.code) {
        key.down.active = true;
    }
    if (keyCode === key.left.code) {
        key.left.active = true;
    }
    if (keyCode === key.right.code) {
        key.right.active = true;
    }
});

document.addEventListener('keyup', (event) => {
    const keyCode = event.code;

    if (keyCode === key.up.code) {
        key.up.active = false;
    }
    if (keyCode === key.down.code) {
        key.down.active = false;
    }
    if (keyCode === key.left.code) {
        key.left.active = false;
    }
    if (keyCode === key.right.code) {
        key.right.active = false;
    }
});
