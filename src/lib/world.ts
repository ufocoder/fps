import Entity from "src/lib/ecs/Entity";
import TextureComponent from "src/lib/ecs/components/TextureComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import ColorComponent from "src/lib/ecs/components/ColorComponent";
import TextureManager from "src/managers/TextureManager";
import CollisionComponent from "./ecs/components/CollisionComponent";
import HealthComponent from "./ecs/components/HealthComponent";

export function createEntities(level: Level, textureManager: TextureManager) {
    
    // player
    const player = new Entity();
    player.addComponent(new BoxComponent(1));
    player.addComponent(new PositionComponent(level.player.x, level.player.y));
    player.addComponent(new HealthComponent(level.player.health, level.player.health));
    player.addComponent(new AngleComponent(level.player.angle));
    player.addComponent(new MoveComponent(3));
    player.addComponent(new RotateComponent(360 / 6));
    player.addComponent(new CameraComponent(40));
    player.addComponent(new ColorComponent('black'));

    // enemies
    const enemies:Entity[] = [];
    level.enemies.forEach((enemy) => {
        const entity = new Entity();

        entity.addComponent(new BoxComponent(1));
        entity.addComponent(new PositionComponent(enemy.x, enemy.y));
        entity.addComponent(new HealthComponent(enemy.health, enemy.health));
        entity.addComponent(new AngleComponent(enemy.angle));
        entity.addComponent(new ColorComponent('red'));

        enemies.push(entity);
    });

    // exit
    const exit = new Entity();
    exit.addComponent(new BoxComponent(1));
    exit.addComponent(new PositionComponent(level.exit.x, level.exit.y));
    exit.addComponent(new ColorComponent('yellow'));

    // walls
    const walls:Entity[] = [];

    level.map.forEach((row, y) => {
        row.forEach((col, x) => {
            if (col === 0) {
                return;
            }
            const wall = new Entity();

            const textureName = level.textures[col]
            const texture = textureManager.get(textureName);

            wall.addComponent(new CollisionComponent());
            wall.addComponent(new BoxComponent(1));
            wall.addComponent(new PositionComponent(x, y));
            wall.addComponent(new TextureComponent(texture))
            wall.addComponent(new ColorComponent('grey'));

            walls.push(wall);
        });
    });

    return [
        ...walls,
        ...enemies,
        exit,
        player,
    ];
}
