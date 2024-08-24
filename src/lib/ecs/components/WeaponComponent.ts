import { Component } from "src/lib/ecs/Component";
import AnimatedSpriteComponent from "./AnimatedSpriteComponent";

export default class WeaponComponent implements Component {
    sprite?: AnimatedSpriteComponent;
}
