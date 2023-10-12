export interface ISprite {
  name: string;
  x: number;
  y: number;
  width: number;
  height: number;
  data: ImageBitmap;
}

export class Sprite {
  private _name!: string;

  private _x!: number;

  private _y!: number;

  private _dx: number = 0;

  private _dy: number = 0;

  private _width!: number;

  private _height!: number;

  private _data!: ImageBitmap;

  constructor({ name, x, y, width, height, data }: ISprite) {
    this._x = x;
    this._y = y;
    this._width = width;
    this._height = height;
    this._data = data;
    this._name = name;
  }

  private drawTextNumber(
    ctx: CanvasRenderingContext2D,
    txt: string,
    font: string,
    x: number,
    y: number
  ) {
    ctx.save();
    ctx.font = font;
    ctx.textBaseline = 'top';
    ctx.lineWidth = 1;
    ctx.fillStyle = 'white';
    ctx.fillText(txt, x, y);
    ctx.strokeText(txt, x, y);
    ctx.restore();
    if (!this._data) {
      // do nothing
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.drawImage(
      this._data,
      this._x + this._dx,
      this._y + this._dy,
      this._width,
      this._height
    );
    ctx.strokeRect(
      this._x + this._dx,
      this._y + this._dy,
      this._width,
      this._height
    );
    this.drawTextNumber(
      ctx,
      this._name,
      'bold 24px Arial',
      this._x + this._width + this._dx - 25,
      this._y + this._dy + 10
    );
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

  get width() {
    return this._width;
  }

  get height() {
    return this._height;
  }

  get name() {
    return this._name;
  }
}
