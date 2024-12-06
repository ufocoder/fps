import AnimatedSpriteComponent from "./AnimatedSpriteComponent";
import WeaponComponent from "./WeaponComponent";


interface WeaponMeleeComponentProps {
    attackDamage: number;
    attackFrequency: number;
    sprite?: AnimatedSpriteComponent
}

export default class WeaponMeleeComponent extends WeaponComponent {

    attackDamage: number;
    attackFrequency: number;
    attackLastTimeAt: number = +new Date();

    constructor(props: WeaponMeleeComponentProps) {
        super();

        const { attackDamage = 15, attackFrequency = 1_000, sprite } = props;

        this.sprite = sprite;
        this.attackDamage = attackDamage;
        this.attackFrequency = attackFrequency;
    }
}
