import Entity from "src/lib/ecs/Entity";
import TextureComponent from "src/lib/ecs/components/TextureComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import FieldOfVisionComponent from "src/lib/ecs/components/FovComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import ColorComponent from "src/lib/ecs/components/ColorComponent";
import TextureManager from "src/managers/TextureManager";

export function createEntities(level: Level, textureManager: TextureManager) {
    const player = new Entity();
    player.addComponent(new BoxComponent(1));
    player.addComponent(new PositionComponent(level.player.x, level.player.y));
    player.addComponent(new AngleComponent(30));
    player.addComponent(new MoveComponent(3));
    player.addComponent(new RotateComponent(36));
    player.addComponent(new FieldOfVisionComponent(40));
    player.addComponent(new ColorComponent('black'));

    // exit
    const exit = new Entity();
    exit.addComponent(new BoxComponent(1));
    exit.addComponent(new PositionComponent(level.exit.x, level.exit.y));
    exit.addComponent(new ColorComponent('yellow'));

    // key
    const key = new Entity();
    key.addComponent(new BoxComponent(1));
    key.addComponent(new PositionComponent(level.player.x + 2, level.player.y + 2));
    key.addComponent(new ColorComponent('oranbe'));
    
    // walls
    const walls:Entity[] = [];

    level.map.forEach((row, y) => {
        row.forEach((col, x) => {
            if (col !== 1) {
                return;
            }
            const wall = new Entity();
            
            wall.addComponent(new BoxComponent(1));
            wall.addComponent(new PositionComponent(x, y));
            wall.addComponent(new TextureComponent(textureManager.get('wall')))
            wall.addComponent(new ColorComponent('grey'));

            walls.push(wall);
        });
    });

    return [
        ...walls,
        key,
        exit,
        player,
    ];
}
