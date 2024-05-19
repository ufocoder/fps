import System from "src/lib/ecs/System";
import MoveComponent from "src/lib/ecs/components/MoveComponent";
import RotateComponent from "src/lib/ecs/components/RotateComponent";
import { Entity } from "../Entity";

const keyCodes = {
  up: "KeyW",
  down: "KeyS",
  left: "KeyA",
  right: "KeyD",
};

export default class ControlSystem extends System {
  componentsRequired = new Set([MoveComponent, RotateComponent]);

  direction = {
    up: false,
    down: false,
    left: false,
    right: false,
  };

  pointerStartX: number | undefined;
  rotationDifference = 0;
  
  start(): void {
    this.createListeners();
  }

  update(_: number, entities: Set<Entity>) {
    entities.forEach((entity) => {
      const components = this.ecs.getComponents(entity)
      const rotateComponent = components.get(RotateComponent);
      const moveComponent = components.get(MoveComponent);

        rotateComponent.rotationDifference = this.rotationDifference;

        moveComponent.direction.forward = this.direction.up;
        moveComponent.direction.back = this.direction.down;
    });

    this.rotationDifference = 0;
}

  destroy(): void {
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
    if (!this.pointerStartX) {
        this.pointerStartX = e.x;
    }

    this.rotationDifference = e.x - this.pointerStartX;

    this.pointerStartX = e.x;
  };

  createListeners() {
    document.addEventListener("keydown", this.handleDocumentKeyDown);
    document.addEventListener("keyup", this.handleDocumentKeyUp);
    document.body.addEventListener("click", document.body.requestPointerLock);
    document.addEventListener("pointerlockchange", (e) => console.log(e));
    document.addEventListener("mousemove", this.handleDocumentMouseMove);
  }

  destroyListeners() {
    document.removeEventListener("keydown", this.handleDocumentKeyDown);
    document.removeEventListener("keyup", this.handleDocumentKeyUp);
    document.removeEventListener("mousemove", this.handleDocumentMouseMove);
  }
}
