import Entity from "src/lib/ecs/Entity";
import TextureComponent from "src/lib/ecs/components/TextureComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import TextureManager from "src/managers/TextureManager";
import CollisionComponent from "./ecs/components/CollisionComponent";
import HealthComponent from "./ecs/components/HealthComponent";
import SpriteComponent from "./ecs/components/SpriteComponent";
import CircleComponent from "./ecs/components/CircleComponent";
import AIComponent from "./ecs/components/AIComponent";
import AnimatedSpriteComponent from "./ecs/components/AnimationComponent";
import AnimationManager from "src/managers/AnimationManager";
// import AIComponent from "./ecs/components/AIComponent";

export function createEntities(level: Level, textureManager: TextureManager, animationManager: AnimationManager,) {
    
    // player
    const player = new Entity();
    player.addComponent(new CircleComponent(0.4));
    player.addComponent(new PositionComponent(level.player.x, level.player.y));
    player.addComponent(new HealthComponent(level.player.health, level.player.health));
    player.addComponent(new AngleComponent(level.player.angle));
    player.addComponent(new MoveComponent(3));
    player.addComponent(new RotateComponent(360 / 6));
    player.addComponent(new CameraComponent(60));
    player.addComponent(new MinimapComponent('black'));

    // enemies
    const enemies:Entity[] = [];
    level.enemies.forEach((enemy) => {
        const entity = new Entity();
        const texture = textureManager.get(enemy.sprite);

        entity.addComponent(new AIComponent(2));
        entity.addComponent(new AnimatedSpriteComponent('idle', {
            'idle': animationManager.get('zombieIdle'),
            'damage': animationManager.get('zombieDamage'),
            'death': animationManager.get('zombieDeath'),
            'walk': animationManager.get('zombieWalk'),
        })),
        entity.addComponent(new CircleComponent(enemy.radius));
        entity.addComponent(new PositionComponent(enemy.x, enemy.y));
        entity.addComponent(new HealthComponent(enemy.health, enemy.health));
        entity.addComponent(new AngleComponent(enemy.angle));
        entity.addComponent(new SpriteComponent(texture));
        entity.addComponent(new SpriteComponent(texture));
        entity.addComponent(new MinimapComponent('red'));

        enemies.push(entity);
    });

    // exit
    const exit = new Entity();
    exit.addComponent(new BoxComponent(1));
    exit.addComponent(new PositionComponent(level.exit.x, level.exit.y));
    exit.addComponent(new MinimapComponent('yellow'));

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
            wall.addComponent(new MinimapComponent('grey'));

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
