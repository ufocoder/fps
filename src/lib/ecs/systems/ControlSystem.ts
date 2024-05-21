import System from "src/lib/ecs/System";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import { Entity } from "../Entity";
import ECS from "..";

const keyCodes = {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
};

export default class ControlSystem extends System {
  componentsRequired = new Set([MoveComponent, RotateComponent]);

  protected readonly container: HTMLElement;

  direction = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

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
      const components = this.ecs.getComponents(entity)
      const rotateComponent = components.get(RotateComponent);
      const moveComponent = components.get(MoveComponent);

        rotateComponent.rotationFactor = this.rotationFactor;

        moveComponent.direction.forward = this.direction.up;
        moveComponent.direction.back = this.direction.down;
    });

    this.rotationFactor = 0;
}

  destroy(): void {
    document.exitPointerLock();
    this.destroyListeners();
  }

  activateDirectionByKeyCode = (keyCode: string) => {
    if (keyCode === keyCodes.up) {
      this.direction.up = true;
    }
    if (keyCode === keyCodes.down) {
      this.direction.down = true;
    }
    if (keyCode === keyCodes.left) {
      this.direction.left = true;
    }
    if (keyCode === keyCodes.right) {
      this.direction.right = true;
    }
  };

  deactivateDirectionByKeyCode = (keyCode: string) => {
    if (keyCode === keyCodes.up) {
      this.direction.up = false;
    }
    if (keyCode === keyCodes.down) {
      this.direction.down = false;
    }
    if (keyCode === keyCodes.left) {
      this.direction.left = false;
    }
    if (keyCode === keyCodes.right) {
      this.direction.right = false;
    }
  };

  handleDocumentKeyDown = (e: KeyboardEvent) => {
    this.activateDirectionByKeyCode(e.code);
  };

  handleDocumentKeyUp = (e: KeyboardEvent) => {
    this.deactivateDirectionByKeyCode(e.code);
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
  }

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