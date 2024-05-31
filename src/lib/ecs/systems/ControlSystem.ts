import ECS from "src/lib/ecs/ExtendedECS";
import { Entity } from "src/lib/ecs/Entity";
import System from "src/lib/ecs/System";
import MoveComponent, {
  MainDirection,
  SideDirection,
} from "src/lib/ecs/components/MoveComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import ControlComponent from "src/lib/ecs/components/ControlComponent";

const keyCodes: Record<string, string> = {
  KeyW: "up",
  KeyS: "down",
  KeyA: "left",
  KeyD: "right",
};

export default class ControlSystem extends System {
  componentsRequired = new Set([ControlComponent, MoveComponent, RotateComponent]);

  protected readonly container: HTMLElement;

  direction: Record<string, boolean> = {
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
      const components = this.ecs.getComponents(entity);
      const rotateComponent = components.get(RotateComponent);
      const moveComponent = components.get(MoveComponent);

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
    });

    this.rotationFactor = 0;
  }

  destroy(): void {
    document.exitPointerLock();
    this.destroyListeners();
  }

  setDirection = (keyCode: string, status: boolean) => {
    const direction = keyCodes[keyCode];

    if (!direction) {
      return;
    }

    this.direction[direction] = status;
  };

  handleDocumentKeyDown = (e: KeyboardEvent) => {
    this.setDirection(e.code, true);
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
