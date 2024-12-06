import { Component } from "src/lib/ecs/Component";
import WeaponComponent from "./WeaponComponent";

export default class PlayerComponent implements Component {
    currentWeapon?: WeaponComponent;
    weapons: Record<number, WeaponComponent> = {};
}
