import { Color } from "src/managers/TextureManager";

const level: Level = {
    world: {
        colors: {
            top: new Color(0, 0, 0, 255),
            bottom: new Color(84, 98, 92, 255),
        }
    },
    map: [
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,1,0,0,0,0],
        [0,0,0,0,0,2,0,0,0,1,0,0,0,0],
        [0,0,0,0,0,1,0,0,0,1,0,0,0,0],
        [0,0,0,0,0,1,1,1,1,1,0,0,0,0],
        [0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    ],
    textures: {
        1: 'wall',
        2: 'exit',
    },
    player: {
        x: 2,
        y: 2,
        angle: 45,
        health: 100,
    },
    enemies: [
        {
            x: 3,
            y: 9,
            angle: 45,
            health: 100,
        },
        {
            x: 9,
            y: 3,
            angle: 45,
            health: 100,
        },
    ],
    exit: {
        x: 4,
        y: 6,
    },
}

export default level;