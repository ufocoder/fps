import AnimatedSpriteComponent from "./AnimatedSpriteComponent";
import WeaponComponent from "./WeaponComponent";

interface WeaponRangeComponentProps {
    bulletSprite: string;
    bulletTotal: number;
    bulletDamage: number;
    bulletSpeed: number;
    attackDistance: number;
    attackFrequency: number;
    sprite?: AnimatedSpriteComponent;
}

export default class WeaponRangeComponent extends WeaponComponent {

    bulletSprite: string;
    bulletTotal: number;
    bulletSpeed: number;
    bulletDamage: number;

    attackDistance: number;
    attackFrequency: number;
    attackLastTimeAt: number = +new Date();

    constructor(props: WeaponRangeComponentProps) {
        super();

        const {
            bulletSprite = '',
            bulletTotal = 30,
            bulletDamage = 15,
            bulletSpeed = 5,
            attackDistance = 4,
            attackFrequency = 1_000,
            sprite
        } = props;

        this.bulletSprite = bulletSprite;
        this.bulletTotal = bulletTotal;
        this.bulletDamage = bulletDamage;
        this.bulletSpeed = bulletSpeed;

        this.attackDistance = attackDistance;
        this.attackFrequency = attackFrequency;

        this.sprite = sprite;
    }
}
