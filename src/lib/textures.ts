export interface Texture {
    width: number;
    height: number;
    bitmap: number[][];
    colors: string[];
}

export const textures: Texture[] = [
    {
        width: 8,
        height: 8,
        bitmap: [
            [1,1,1,1,1,1,1,1],
            [0,0,0,1,0,0,0,1],
            [1,1,1,1,1,1,1,1],
            [0,1,0,0,0,1,0,0],
            [1,1,1,1,1,1,1,1],
            [0,0,0,1,0,0,0,1],
            [1,1,1,1,1,1,1,1],
            [0,1,0,0,0,1,0,0]
        ],
        colors: [
            "rgb(255, 241, 232)",
            "rgb(194, 195, 199)",
        ]
    },
];
