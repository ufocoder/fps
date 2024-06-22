export function degreeToRadians(degree: number) {
    return degree * Math.PI / 180;
}

export function radiansToDegrees(radians: number) {
    return 180 * radians / Math.PI;
}

export function minmax(value: number, min: number, max: number) {
    return Math.max(min, Math.min(value, max));
}

export function angle(x1: number, y1: number, x2: number, y2: number): number {
    const angleRadians = Math.atan2(y2 - y1, x2 - x1);
    const angleDegrees = angleRadians * (180 / Math.PI);

    return angleDegrees < 0 ? angleDegrees + 360 : angleDegrees;
}

export function distance(x1: number, y1: number, x2: number, y2: number): number {
    return Math.sqrt(Math.pow(x1 - x2, 2) + Math.pow(y1 - y2, 2));
}

export function normalizeAngle(a: number) {
    return (a + 360) % 360;
}

export function lerp(from: number, to: number, percent: number) {
    const val = minmax(percent, 0, 1);
    return from + (to - from) * val;
}


export class Vec2D implements Vector2D {
    private constructor(public x: number, public y: number) {}

    static from(x: number, y: number) {
        return new Vec2D(x, y);
    }
    static fromObj(cords: Vec2D) {
        return new Vec2D(cords.x, cords.y);
    }

    static zeros() {
        return new Vec2D(0, 0);
    }

    add(vec: Vector2D): Vec2D {
        return Vec2D.from(this.x + vec.x, this.y + vec.y);
    }

    addX(x: number): Vec2D {
        return Vec2D.from(this.x + x, this.y);
    }
    addY(y: number): Vec2D {
        return Vec2D.from(this.x, this.y + y);
    }

    subtract(vec: Vector2D): Vec2D {
        return Vec2D.from(this.x - vec.x, this.y - vec.y);
    }
    subtractX(x: number): Vec2D {
        return Vec2D.from(this.x - x, this.y);
    }
    subtractY(y: number): Vec2D {
        return Vec2D.from(this.x, this.y - y);
    }

    divide(vec: Vector2D): Vec2D {
        return Vec2D.from(this.x / vec.x, this.y / vec.y);
    }

    multiply(vec: Vector2D): Vec2D {
        return Vec2D.from(this.x * vec.x, this.y * vec.y);
    }

    magnitude(): number {
        return Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2));
    }

    isEqual(vec: Vector2D) {
        return this.x === vec.x && this.y === vec.y;
    }
}
