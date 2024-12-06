import AnimatedSpriteComponent from "src/lib/ecs/components/AnimatedSpriteComponent";
import WeaponMeleeComponent from "src/lib/ecs/components/WeaponMeleeComponent";
import WeaponRangeComponent from "src/lib/ecs/components/WeaponRangeComponent";
import AnimationManager from "src/managers/AnimationManager";

export const generateKnifeWeapon = (animationManager: AnimationManager) => new WeaponMeleeComponent({
  sprite: new AnimatedSpriteComponent('idle', {
    attack: animationManager.get("knifeAttack"),
    idle: animationManager.get("knifeIdle"),
  }),
  attackDamage: 30, 
  attackFrequency: 500,
});

export const generatePistolWeapon = (animationManager: AnimationManager, bulletTotal: number = 30) => new WeaponRangeComponent({
  bulletTotal,
  bulletSprite: "pistol_bullet",
  bulletDamage: 100,
  bulletSpeed: 35,
  attackDistance: 15,
  attackFrequency: 500,
  sprite: new AnimatedSpriteComponent("idle", {
    attack: animationManager.get("pistolAttack"),
    idle: animationManager.get("pistolIdle"),
  }),
});