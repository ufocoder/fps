import ECS from "src/lib/ecs";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import MoveComponent, {
  MainDirection,
  SideDirection,
} from "src/lib/ecs/components/MoveComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import ControlComponent from "src/lib/ecs/components/ControlComponent";
import PlayerComponent from "../components/PlayerComponent";

const directionKeyCodes: Record<string, string> = {
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

const weaponKeyCodes: Record<string, number> = {
  Digit1: 1,
  Digit2: 2,
  Digit3: 3,
  Digit4: 4,
};

export default class ControlSystem extends System {
  componentsRequired = new Set([ControlComponent, MoveComponent, RotateComponent, PlayerComponent]);

  protected readonly container: HTMLElement;

  direction: Record<string, boolean> = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  lastActiveWeapon: number = 0;

  pointerStartX: number | undefined;
  rotationFactor = 0;
  isPointerLocked = false;

  constructor(ecs: ECS, container: HTMLElement) {
    super(ecs);

    this.container = container;
  }

  start(): void {
    this.createListeners();
    this.requestPointerLock();
  }

  update(_: number, entities: Set<Entity>) {
    entities.forEach((entity) => {
      const componentContainer = this.ecs.getComponents(entity);
      const playerComponent = componentContainer.get(PlayerComponent);
      const rotateComponent = componentContainer.get(RotateComponent);
      const moveComponent = componentContainer.get(MoveComponent);

      rotateComponent.rotationFactor = this.rotationFactor;

      if (this.direction.up) {
        moveComponent.mainDirection = MainDirection.Forward;
      } else if (this.direction.down) {
        moveComponent.mainDirection = MainDirection.Back;
      } else {
        moveComponent.mainDirection = MainDirection.None;
      }

      if (this.direction.left) {
        moveComponent.sideDirection = SideDirection.Left;
      } else if (this.direction.right) {
        moveComponent.sideDirection = SideDirection.Right;
      } else {
        moveComponent.sideDirection = SideDirection.None;
      }

      if (playerComponent.weapons[this.lastActiveWeapon] && playerComponent.currentWeapon !== playerComponent.weapons[this.lastActiveWeapon]) {
        playerComponent.currentWeapon = playerComponent.weapons[this.lastActiveWeapon];
      }
    });

    this.rotationFactor = 0;
  }

  destroy(): void {
    document.exitPointerLock();
    this.destroyListeners();
  }

  setDirection = (keyCode: string, status: boolean) => {
    const direction = directionKeyCodes[keyCode];

    if (!direction) {
      return;
    }

    this.direction[direction] = status;
  };

  setWeapon = (keyCode: string) => {
    const weaponCode = weaponKeyCodes[keyCode];

    if (!weaponCode) {
      return;
    }

    this.lastActiveWeapon = weaponCode;
  };

  handleDocumentKeyDown = (e: KeyboardEvent) => {
    this.setDirection(e.code, true);
    this.setWeapon(e.code);
  };

  handleDocumentKeyUp = (e: KeyboardEvent) => {
    this.setDirection(e.code, false);
  };

  handleDocumentMouseMove = (e: MouseEvent) => {
    this.rotationFactor = e.movementX;
  };

  handlePointerLockChange = () => {
    if (this.isPointerLocked) {
      document.addEventListener("mousemove", this.handleDocumentMouseMove);
    } else {
      document.removeEventListener("mousemove", this.handleDocumentMouseMove);
    }

    this.isPointerLocked = !this.isPointerLocked;
  };

  requestPointerLock = () => {
    this.container.requestPointerLock();
    this.isPointerLocked = true;
  };

  createListeners() {
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    document.addEventListener("keyup", this.handleDocumentKeyUp);
    document.addEventListener("pointerlockchange", this.handlePointerLockChange);
    this.container.addEventListener("click", this.requestPointerLock);
  }

  destroyListeners() {
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("keyup", this.handleDocumentKeyUp);
    document.removeEventListener("pointerlockchange", this.handlePointerLockChange);
    this.container.removeEventListener("click", this.requestPointerLock);
  }
}
