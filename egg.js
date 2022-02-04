class Vec2 {
  constructor(x, y) {
    this.x = 0;
    this.y = 0;
    this.set(x, y);
  }
  mag() {
    return Math.sqrt(this.x ** 2 + this.y ** 2);
  }
  set(x, y) {
    this.x = x;
    this.y = y;
  }
  normalize() {
    const mag = this.mag();
    this.x /= mag;
    this.y /= mag;
  }
  add(other) {
    this.x += other.x;
    this.y += other.y;
  }
  sub(other) {
    this.x -= other.x;
    this.y -= other.y;
  }
  muls(scalar) {
    this.x *= scalar;
    this.y *= scalar;
  }
  scale(scalar) {
    let mag = this.mag();
    this.x = scalar * this.x / mag;
    this.y = scalar * this.y / mag;
  }
  cross(other) {
    return this.x * other.y - this.y * other.x;
  }
}
let mouse = new Vec2(0, 0);
document.addEventListener("mousemove", (ev) => {
  mouse.set(ev.clientX, ev.clientY);
});
const _Rect = class {
  constructor(el) {
    this.el = el;
    let bounds = el.getBoundingClientRect();
    this.opos = new Vec2(bounds.x, bounds.y);
    this.size = new Vec2(bounds.width, bounds.height);
    this.off = new Vec2(0, 0);
    this.vel = new Vec2(0, 0);
    this.acc = new Vec2(0, 0);
    this.rot = 0;
    this.rotv = 0;
    this.torque = 0;
    this.scale = 1;
  }
  updateOriginalPosition() {
    this.el.style.transform = "none";
    let bounds = this.el.getBoundingClientRect();
    this.opos.set(bounds.x, bounds.y);
  }
  animate() {
    this.updateAccel();
    this.updateVelocity();
    this.updatePos();
    this.updateAngularAccel();
    this.updateAngularVelocity();
    this.updateAngle();
    this.updateTransform();
  }
  get pos() {
    return new Vec2(this.opos.x + this.off.x, this.opos.y + this.off.y);
  }
  updateAngularAccel() {
    let cross = this.pos.cross(mouse) * _Rect.ROT_ACCEL_SCALE;
    if (Math.abs(cross) > _Rect.ROT_ACCEL_MAX) {
      cross = cross / Math.abs(cross) * _Rect.ROT_ACCEL_MAX;
    }
    this.torque = -cross;
  }
  updateAngularVelocity() {
    this.rotv += this.torque;
    if (Math.abs(this.rotv) > _Rect.ROT_VEL_MAX) {
      this.rotv = _Rect.ROT_VEL_MAX * this.rotv / Math.abs(this.rotv);
    }
  }
  updateAngle() {
    this.rot += this.rotv / 10;
  }
  updateAccel() {
    this.acc.set(mouse.x - (this.opos.x + this.off.x + this.size.x / 2), mouse.y - (this.opos.y + this.off.y + this.size.y / 2));
    this.acc.scale(_Rect.ACCEL_RATE);
  }
  updateVelocity() {
    this.vel.add(this.acc);
    const mag = this.vel.mag();
    if (mag > _Rect.VEL_MAX) {
      this.vel.scale(_Rect.VEL_MAX);
    }
  }
  updatePos() {
    this.off.add(this.vel);
  }
  updateTransform() {
    this.el.style.transform = `translate(${this.off.x}px, ${this.off.y}px) rotate(${this.rot}rad) scale(${this.scale})`;
  }
};
let Rect = _Rect;
Rect.ACCEL_RATE = 0.08;
Rect.VEL_MAX = 6.5;
Rect.ROT_ACCEL_MAX = 4.08;
Rect.ROT_ACCEL_SCALE = 1.1;
Rect.ROT_VEL_MAX = 0.01;
Rect.SCALE_MAX = 1;
Rect.SCALE_MIN = 0.1;
function animate(rects) {
  requestAnimationFrame(() => animate(rects));
  for (const rect of rects) {
    rect.animate();
  }
}
export function eggify(selector) {
  const rects = [...document.querySelectorAll(selector)].map((el) => new Rect(el));
  document.addEventListener("resize", (ev) => {
    rects.forEach((rect) => rect.updateOriginalPosition());
  });
  animate(rects);
}
