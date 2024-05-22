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
import ECS from "./ecs";
import EnemyComponent from "./ecs/components/EnemyComponent";
// import AIComponent from "./ecs/components/AIComponent";

export function createWorld(ecs: ECS, level: Level, textureManager: TextureManager, animationManager: AnimationManager,) {
    
    // player
    const player = ecs.addEntity();

    ecs.addComponent(player, new CircleComponent(0.4));
    ecs.addComponent(player, new PositionComponent(level.player.x, level.player.y));
    ecs.addComponent(player, new HealthComponent(level.player.health, level.player.health));
    ecs.addComponent(player, new AngleComponent(level.player.angle));
    ecs.addComponent(player, new MoveComponent(3));
    ecs.addComponent(player, new RotateComponent(360 / 15));
    ecs.addComponent(player, new CameraComponent(60));
    ecs.addComponent(player, new MinimapComponent('black'));

    // enemies
    level.enemies?.forEach((enemy) => {
        const entity = ecs.addEntity();
        const texture = textureManager.get(enemy.sprite);

        ecs.addComponent(entity, new MoveComponent(1));
        ecs.addComponent(entity, new EnemyComponent())

        if (enemy.ai) {
            ecs.addComponent(entity, new AIComponent(2));
            ecs.addComponent(entity, new AnimatedSpriteComponent('idle', {
                'attack': animationManager.get('zombieAttack'),
                'idle': animationManager.get('zombieIdle'),
                'damage': animationManager.get('zombieDamage'),
                'death': animationManager.get('zombieDeath'),
                'walk': animationManager.get('zombieWalk'),
            }))
        }

        ecs.addComponent(entity, new CircleComponent(enemy.radius));
        ecs.addComponent(entity, new PositionComponent(enemy.x, enemy.y));
        ecs.addComponent(entity, new HealthComponent(enemy.health, enemy.health));
        ecs.addComponent(entity, new AngleComponent(enemy.angle));
        ecs.addComponent(entity, new SpriteComponent(texture));
        ecs.addComponent(entity, new RotateComponent());
        ecs.addComponent(entity, new MinimapComponent('red'));
    });

    // exit
    const exit = ecs.addEntity();

    ecs.addComponent(exit, new BoxComponent(1));
    ecs.addComponent(exit, new PositionComponent(level.exit.x, level.exit.y));
    ecs.addComponent(exit, new MinimapComponent('yellow'));

    // walls
    level.map.forEach((row, y) => {
        row.forEach((col, x) => {
            if (col === 0) {
                return;
            }
            const wall = ecs.addEntity();

            const textureName = level.textures[col]
            const texture = textureManager.get(textureName);

            ecs.addComponent(wall, new CollisionComponent());
            ecs.addComponent(wall, new BoxComponent(1));
            ecs.addComponent(wall, new PositionComponent(x, y));
            ecs.addComponent(wall, new TextureComponent(texture))
            ecs.addComponent(wall, new MinimapComponent('grey'));
        });
    });
}
