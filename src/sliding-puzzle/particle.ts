export interface IParticle {
  width: number;
  height: number;
}

function getRandomColor() {
  let r = 0;
  let g = 0;
  let b = 0;
  while (r < 100 && g < 100 && b < 100) {
    r = Math.floor(Math.random() * 256);
    g = Math.floor(Math.random() * 256);
    b = Math.floor(Math.random() * 256);
  }

  return `rgb(${r},${g},${b})`;
}

export class Particle {
  private _x!: number;

  private _y!: number;

  private _dx: number = 0;

  private _dy: number = 0;

  private _color!: string;

  private _width!: number;

  private _height!: number;

  constructor({ width, height }: IParticle) {
    this._x = width * Math.random();
    this._y = height * Math.random();
    this._dx = 4 * Math.random() - 2;
    this._dy = 4 * Math.random() - 2;
    this._color = getRandomColor();
    this._width = width;
    this._height = height;
  }

  draw(ctx: CanvasRenderingContext2D) {
    this._x += this._dx;
    this._y += this._dy;

    if (this.x < 0 || this.x > this._width) this._dx = -this._dx;

    if (this.y < 0 || this.y > this._height) this._dy = -this._dy;

    ctx.fillStyle = this._color;
    ctx.fillRect(this.x, this.y, 2, 2);
  }

  set dx(dx: number) {
    this._dx = dx;
  }

  set dy(dy: number) {
    this._dy = dy;
  }

  set x(x: number) {
    this._x = x;
  }

  get x() {
    return this._x;
  }

  set y(y: number) {
    this._y = y;
  }

  get y() {
    return this._y;
  }
}
