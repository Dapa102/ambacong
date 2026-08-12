export class InputSystem {
  constructor(target = window) {
    this.keys = new Set();
    this.mouseDelta = { x: 0, y: 0 };
    this.locked = false;
    this.onKey = null;
    this.onPointerLockChange = null;
    this.blocked = false;

    target.addEventListener('keydown', (event) => {
      if (['Tab', 'Space', 'ArrowUp', 'ArrowDown'].includes(event.code)) {
        event.preventDefault();
      }
      if (!event.repeat) {
        this.keys.add(event.code);
        this.onKey?.(event.code, true);
      }
    });

    target.addEventListener('keyup', (event) => {
      this.keys.delete(event.code);
      this.onKey?.(event.code, false);
    });

    target.addEventListener('mousemove', (event) => {
      if (this.locked && !this.blocked) {
        this.mouseDelta.x += event.movementX;
        this.mouseDelta.y += event.movementY;
      }
    });
  }

  bindLock(element) {
    element.addEventListener('click', () => {
      if (!this.blocked && !this.locked) element.requestPointerLock();
    });
    document.addEventListener('pointerlockchange', () => {
      this.locked = document.pointerLockElement === element;
      this.onPointerLockChange?.(this.locked, document.pointerLockElement);
    });
  }

  requestLock(element) {
    const promise = element.requestPointerLock?.();
    if (promise?.catch) promise.catch(() => {});
  }

  exitLock() {
    if (document.pointerLockElement) {
      const promise = document.exitPointerLock();
      if (promise?.catch) promise.catch(() => {});
    }
  }

  consumeMouseDelta() {
    const delta = { x: this.mouseDelta.x, y: this.mouseDelta.y };
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
    return delta;
  }

  clear() {
    this.keys.clear();
    this.mouseDelta.x = 0;
    this.mouseDelta.y = 0;
  }
}
