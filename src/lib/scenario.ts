import ECS from "src/lib/ecs";
import AIComponent from "src/lib/ecs/components/AIComponent";
import AngleComponent from "src/lib/ecs/components/AngleComponent";
import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import AnimationManager from "src/managers/AnimationManager";
import BoxComponent from "src/lib/ecs/components/BoxComponent";
import CameraComponent from "src/lib/ecs/components/CameraComponent";
import CircleComponent from "src/lib/ecs/components/CircleComponent";
import CollisionComponent from "src/lib/ecs/components/CollisionComponent";
import ControlComponent from "src/lib/ecs/components/ControlComponent";
import EnemyComponent from "src/lib/ecs/components/EnemyComponent";
import HealthComponent from "src/lib/ecs/components/HealthComponent";
import MinimapComponent from "src/lib/ecs/components/MinimapComponent";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import PositionComponent from "src/lib/ecs/components/PositionComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import TextureComponent from "src/lib/ecs/components/TextureComponent";
import TextureManager from "src/managers/TextureManager";
import WeaponComponent from "./ecs/components/WeaponComponent";

export function createEntities(
  ecs: ECS,
  level: Level,
  textureManager: TextureManager,
  animationManager: AnimationManager
) {
  // player
  const player = ecs.addEntity();

  ecs.addComponent(player, new ControlComponent());
  ecs.addComponent(player, new CircleComponent(0.4));
  ecs.addComponent(player, new WeaponComponent(10, 1_000));
  ecs.addComponent(
    player,
    new PositionComponent(level.player.x, level.player.y)
  );
  ecs.addComponent(
    player,
    new HealthComponent(level.player.health, level.player.health)
  );
  ecs.addComponent(player, new AngleComponent(level.player.angle));
  ecs.addComponent(player, new MoveComponent(3));
  ecs.addComponent(player, new RotateComponent(360 / 20));
  ecs.addComponent(player, new CameraComponent(60));
  ecs.addComponent(player, new MinimapComponent("black"));

  // enemies
  level.enemies?.forEach((enemy) => {
    const entity = ecs.addEntity();

    ecs.addComponent(entity, new MoveComponent(1));
    ecs.addComponent(entity, new EnemyComponent());

    if (enemy.ai) {
      ecs.addComponent(entity, new AIComponent(enemy.ai, enemy.attack, 500));
    }

    switch (enemy.type) {
      case "zombie":
        ecs.addComponent(
          entity,
          new AnimatedSpriteComponent("idle", {
            attack: animationManager.get("zombieAttack"),
            idle: animationManager.get("zombieIdle"),
            damage: animationManager.get("zombieDamage"),
            death: animationManager.get("zombieDeath"),
            walk: animationManager.get("zombieWalk"),
          })
        );
        break;
      case "soldier":
        ecs.addComponent(
          entity, 
          new WeaponComponent(enemy.attack)
        );
        ecs.addComponent(
          entity,
          new AnimatedSpriteComponent("idle", {
            attack: animationManager.get("soldierAttack"),
            idle: animationManager.get("soldierIdle"),
            damage: animationManager.get("soldierDamage"),
            death: animationManager.get("soldierDeath"),
            walk: animationManager.get("soldierWalk"),
          })
        );
        break;
      case "slayer":
        ecs.addComponent(
          entity,
          new AnimatedSpriteComponent("idle", {
            attack: animationManager.get("slayerAttack"),
            idle: animationManager.get("slayerIdle"),
            damage: animationManager.get("slayerDamage"),
            death: animationManager.get("slayerDeath"),
            walk: animationManager.get("slayerWalk"),
          })
        );
        break;
      case "flyguy":
        ecs.addComponent(
          entity,
          new AnimatedSpriteComponent("idle", {
            attack: animationManager.get("flyguyAttack"),
            idle: animationManager.get("flyguyIdle"),
            damage: animationManager.get("flyguyDamage"),
            death: animationManager.get("flyguyDeath"),
            walk: animationManager.get("flyguyWalk"),
          })
        );
        break;
      case "commando":
        ecs.addComponent(
          entity, 
          new WeaponComponent(enemy.attack)
        );
        ecs.addComponent(
          entity,
          new AnimatedSpriteComponent("idle", {
            attack: animationManager.get("commandoAttack"),
            idle: animationManager.get("commandoIdle"),
            damage: animationManager.get("commandoDamage"),
            death: animationManager.get("commandoDeath"),
            walk: animationManager.get("commandoWalk"),
          })
        );
        break;
      case "tank":
        ecs.addComponent(
          entity, 
          new WeaponComponent(enemy.attack)
        );
        ecs.addComponent(
          entity,
          new AnimatedSpriteComponent("idle", {
            attack: animationManager.get("tankAttack"),
            idle: animationManager.get("tankIdle"),
            damage: animationManager.get("tankDamage"),
            death: animationManager.get("tankDeath"),
            walk: animationManager.get("tankWalk"),
          })
        );
        break;
    }

    ecs.addComponent(entity, new CircleComponent(enemy.radius));
    ecs.addComponent(entity, new PositionComponent(enemy.x, enemy.y));
    ecs.addComponent(entity, new HealthComponent(enemy.health, enemy.health));
    ecs.addComponent(entity, new AngleComponent(enemy.angle));
    ecs.addComponent(entity, new RotateComponent());
    ecs.addComponent(entity, new MinimapComponent("red"));
  });

  // exit
  const exit = ecs.addEntity();

  ecs.addComponent(exit, new BoxComponent(1));
  ecs.addComponent(exit, new PositionComponent(level.exit.x, level.exit.y));
  ecs.addComponent(exit, new MinimapComponent("yellow"));

  // walls
  level.map.forEach((row, y) => {
    row.forEach((col, x) => {
      if (col === 0) {
        return;
      }
      const wall = ecs.addEntity();

      const textureName = level.textures[col];
      const texture = textureManager.get(textureName);

      ecs.addComponent(wall, new CollisionComponent());
      ecs.addComponent(wall, new BoxComponent(1));
      ecs.addComponent(wall, new PositionComponent(x, y));
      ecs.addComponent(wall, new TextureComponent(texture));
      ecs.addComponent(wall, new MinimapComponent("grey"));
    });
  });
}
