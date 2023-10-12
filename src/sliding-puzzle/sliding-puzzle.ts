import { imageSlice } from './image-slice';
import { Sprite } from './sprite';

const css = String.raw;

function getRandom(min: number, max: number) {
  return Math.floor(Math.random() * (max - min) + min);
}

function getArr(
  s: Array<number>,
  e: number,
  e1: number,
  max: number,
  min: number
) {
  const arr: Array<Array<number>> = [];

  if (s[0] + 1 <= max) {
    if (!(e === s[0] + 1 && e1 === s[1])) {
      arr.push([s[0] + 1, s[1]]);
    }
  }
  if (s[1] + 1 <= max) {
    if (!(e === s[0] && e1 === s[1] + 1)) {
      arr.push([s[0], s[1] + 1]);
    }
  }
  if (s[0] - 1 >= min) {
    if (!(e === s[0] - 1 && e1 === s[1])) {
      arr.push([s[0] - 1, s[1]]);
    }
  }
  if (s[1] - 1 >= min) {
    if (!(e === s[0] && e1 === s[1] - 1)) {
      arr.push([s[0], s[1] - 1]);
    }
  }

  return arr;
}

export class SlidingPuzzle extends HTMLElement {
  static get observedAttributes() {
    return ['image'];
  }

  private _numRowCol = 3;

  private _slen = 420;

  private _fps = 30;

  private _omMouseDown = false;

  private _spriteMove?: Sprite;

  private _spriteMoveX: number = 0;

  private _spriteMoveY: number = 0;

  private _spriteMoveArrayX: number = -1;

  private _spriteMoveArrayY: number = -1;

  private _emptyX: number = 0;

  private _emptyY: number = 0;

  private _emptyArrayX: number = 0;

  private _emptyArrayY: number = 0;

  private _onShuffle = false;

  private _isStart = false;

  private _steps = 0;

  private _sprites?: Array<Array<Sprite | undefined>> = Array.from(
    { length: 3 },
    () => Array.from({ length: 3 })
  );

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css`
      canvas {
        border: 1px solid black;
      }
    `;

    const template = document.createElement('template');
    template.innerHTML = /* HTML */ `
      <canvas width="${this._slen}" height="${this._slen}"></canvas>
    `;

    shadow.append(style, template.content.cloneNode(true));
  }

  private _render() {
    const shadow = this.shadowRoot;
    if (shadow) {
      const canvas = shadow.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, this._slen, this._slen);
          for (let x = 0; x < this._numRowCol; x++) {
            for (let y = 0; y < this._numRowCol; y++) {
              if (this._sprites![x][y]) {
                this._sprites![x][y]?.draw(ctx);
              }
            }
          }
        }
      }
    }
  }

  private _gameLoop() {
    const loop = () => {
      this._render();

      setTimeout(() => {
        window.requestAnimationFrame(loop);
      }, 1000 / this._fps);
    };
    window.requestAnimationFrame(loop);
  }

  private _moveSprite(fromX: number, toX: number, fromY: number, toY: number) {
    this._sprites![toX][toY] = this._sprites![fromX][fromY];
    this._sprites![fromX][fromY] = undefined;
    const sprite = this._sprites![toX][toY];
    if (sprite) {
      sprite.x = (this._slen / this._numRowCol) * toX;
      sprite.y = (this._slen / this._numRowCol) * toY;
    }

    this._emptyX = (this._slen / this._numRowCol) * fromX;
    this._emptyY = (this._slen / this._numRowCol) * fromY;
    this._emptyArrayX = fromX;
    this._emptyArrayY = fromY;
  }

  private _moveSpriteAnim = (
    fromArrayX: number,
    fromArrayY: number,
    toArrayX: number,
    toArrayY: number
  ) => {
    const speed = 20;
    return new Promise(resolve => {
      let dx = 0;
      let dy = 0;
      let isX = false;
      const movv = () => {
        setTimeout(() => {
          const sprite = this._sprites![fromArrayX][fromArrayY];
          if (sprite) {
            if (toArrayX - fromArrayX !== 0) {
              dx += speed * (toArrayX - fromArrayX);
              sprite.dx = dx;
              isX = true;
            }
            if (toArrayY - fromArrayY !== 0) {
              dy += speed * (toArrayY - fromArrayY);
              sprite.dy = dy;
            }
          }
          if (isX) {
            if (Math.abs(dx) <= this._slen / this._numRowCol) {
              window.requestAnimationFrame(movv);
            } else {
              if (sprite) {
                sprite.dx = 0;
                sprite.x +=
                  (this._slen / this._numRowCol) * (toArrayX - fromArrayX);
              }

              this._sprites![toArrayX][toArrayY] =
                this._sprites![fromArrayX][fromArrayY];
              this._emptyX = (this._slen / this._numRowCol) * fromArrayX;
              this._emptyY = (this._slen / this._numRowCol) * fromArrayY;
              this._emptyArrayX = fromArrayX;
              this._emptyArrayY = fromArrayY;
              resolve('OK');
            }
          } else if (Math.abs(dy) <= this._slen / this._numRowCol) {
            window.requestAnimationFrame(movv);
          } else {
            if (sprite) {
              sprite.dy = 0;
              sprite.y +=
                (this._slen / this._numRowCol) * (toArrayY - fromArrayY);
            }

            this._sprites![toArrayX][toArrayY] =
              this._sprites![fromArrayX][fromArrayY];
            this._emptyX = (this._slen / this._numRowCol) * fromArrayX;
            this._emptyY = (this._slen / this._numRowCol) * fromArrayY;
            this._emptyArrayX = fromArrayX;
            this._emptyArrayY = fromArrayY;
            resolve('OK');
          }
        }, 1);
      };
      window.requestAnimationFrame(movv);
    });
  };

  private _shuffle = async () => {
    let s = 2;
    let s1 = 2;
    let e = s;
    let e1 = s1;
    /* eslint-disable no-await-in-loop */
    for (let i = 0; i < 50; i++) {
      const arr = getArr([s, s1], e, e1, 2, 0);
      const r = getRandom(0, arr.length);
      await this._moveSpriteAnim(arr[r][0], arr[r][1], s, s1);
      e = s;
      e1 = s1;
      [s, s1] = arr[r];
    }
  };

  private _touchstart = (e: TouchEvent) => {
    if (this._onShuffle) {
      return;
    }
    if (!this._isStart) {
      return;
    }

    const target = e.currentTarget as HTMLElement;
    const mouseX = e.touches[0].pageX - target.offsetLeft;
    const mouseY = e.touches[0].pageY - target.offsetTop;
    this._spriteMove = undefined;
    this._onmousedownNext(mouseX, mouseY);
  };

  private _touchmove = (e: TouchEvent) => {
    if (this._onShuffle) {
      return;
    }
    if (!this._isStart) {
      return;
    }

    if (this._omMouseDown) {
      const target = e.currentTarget as HTMLElement;
      const mouseX = e.touches[0].pageX - target.offsetLeft;
      const mouseY = e.touches[0].pageY - target.offsetTop;
      this._onmousemoveNext(mouseX, mouseY);
      e.preventDefault();
    }
  };

  private _touchend = (e: TouchEvent) => {
    if (!this._isStart) {
      return;
    }

    this._omMouseDown = false;
    const target = e.currentTarget as HTMLElement;
    const mouseX = e.changedTouches[0].pageX - target.offsetLeft;
    const mouseY = e.changedTouches[0].pageY - target.offsetTop;
    this._onmouseupNext(mouseX, mouseY);
  };

  private _onmouseupNext = (mouseX: number, mouseY: number) => {
    if (this._spriteMove) {
      let dx = Math.abs(mouseX - this._spriteMoveX);
      let dy = Math.abs(mouseY - this._spriteMoveY);

      if (
        this._emptyArrayX - this._spriteMoveArrayX > 0 &&
        mouseX - this._spriteMoveX < 0
      ) {
        dx = 0;
      }
      if (
        this._emptyArrayX - this._spriteMoveArrayX < 0 &&
        mouseX - this._spriteMoveX > 0
      ) {
        dx = 0;
      }

      if (
        this._emptyArrayY - this._spriteMoveArrayY > 0 &&
        mouseY - this._spriteMoveY < 0
      ) {
        dy = 0;
      }
      if (
        this._emptyArrayY - this._spriteMoveArrayY < 0 &&
        mouseY - this._spriteMoveY > 0
      ) {
        dy = 0;
      }

      if (this._spriteMoveX !== 0) {
        if (dx >= this._spriteMove.width / 2) {
          this._moveSprite(
            this._spriteMoveArrayX,
            this._emptyArrayX,
            this._spriteMoveArrayY,
            this._emptyArrayY
          );
        }
      }
      if (this._spriteMoveY !== 0) {
        if (dy >= this._spriteMove.height / 2) {
          this._moveSprite(
            this._spriteMoveArrayX,
            this._emptyArrayX,
            this._spriteMoveArrayY,
            this._emptyArrayY
          );
        }
      }
      this._spriteMove.dx = 0;
      this._spriteMove.dy = 0;
      this._steps += 1;

      let cek = '';
      for (let y = 0; y < this._numRowCol; y++) {
        for (let x = 0; x < this._numRowCol; x++) {
          if (this._sprites![x][y]) {
            const c = this._sprites![x][y];
            if (c) {
              cek += c.name;
            }
          } else {
            cek += '!';
          }
        }
      }
      if (cek === '12345678!') {
        this._isStart = false;
        this.dispatchEvent(
          new CustomEvent('onFinish', {
            detail: { finish: true },
          })
        );
      }

      this.dispatchEvent(
        new CustomEvent('onStep', {
          detail: { step: this._steps },
        })
      );
    }
  };

  private _onmouseup = (e: MouseEvent) => {
    if (!this._isStart) {
      return;
    }

    this._omMouseDown = false;
    const target = e.currentTarget as HTMLElement;
    const mouseX = e.pageX - target.offsetLeft;
    const mouseY = e.pageY - target.offsetTop;
    this._onmouseupNext(mouseX, mouseY);
  };

  private _onmousemoveNext = (mouseX: number, mouseY: number) => {
    if (this._spriteMove) {
      let dx = mouseX - this._spriteMoveX;
      let dy = mouseY - this._spriteMoveY;

      if (this._emptyArrayX - this._spriteMoveArrayX > 0 && dx < 0) {
        dx = 0;
      }
      if (this._emptyArrayX - this._spriteMoveArrayX < 0 && dx > 0) {
        dx = 0;
      }

      if (this._emptyArrayY - this._spriteMoveArrayY > 0 && dy < 0) {
        dy = 0;
      }
      if (this._emptyArrayY - this._spriteMoveArrayY < 0 && dy > 0) {
        dy = 0;
      }

      if (this._spriteMoveX !== 0) {
        // max can move x
        if (Math.abs(dx) > this._slen / this._numRowCol) {
          if (dx < 1) {
            dx = -(this._slen / this._numRowCol);
          } else {
            dx = this._slen / this._numRowCol;
          }
        }
        this._spriteMove.dx = dx;
      }
      if (this._spriteMoveY !== 0) {
        // max can move y
        if (Math.abs(dy) > this._slen / this._numRowCol) {
          if (dy < 1) {
            dy = -(this._slen / this._numRowCol);
          } else {
            dy = this._slen / this._numRowCol;
          }
        }
        this._spriteMove.dy = dy;
      }
    }
  };

  private _onmousemove = (e: MouseEvent) => {
    if (this._onShuffle) {
      return;
    }
    if (!this._isStart) {
      return;
    }

    if (this._omMouseDown) {
      const target = e.currentTarget as HTMLElement;
      const mouseX = e.pageX - target.offsetLeft;
      const mouseY = e.pageY - target.offsetTop;
      this._onmousemoveNext(mouseX, mouseY);
    }
  };

  private _onmousedownNext = (mouseX: number, mouseY: number) => {
    for (let x = 0; x < this._numRowCol; x++) {
      for (let y = 0; y < this._numRowCol; y++) {
        if (this._sprites![x][y]) {
          const sprite = this._sprites![x][y];
          if (sprite) {
            if (
              mouseX >= sprite.x &&
              mouseX <= sprite.x + sprite.width &&
              mouseY >= sprite.y &&
              mouseY <= sprite.y + sprite.height
            ) {
              if (sprite.x === this._emptyX || sprite.y === this._emptyY) {
                if (
                  Math.abs(x - this._emptyArrayX) === 1 &&
                  this._emptyArrayY === y
                ) {
                  this._spriteMove = sprite;
                  this._spriteMoveX = mouseX;
                  this._spriteMoveY = 0;
                  this._omMouseDown = true;
                  this._spriteMoveArrayX = x;
                  this._spriteMoveArrayY = y;
                }
                if (
                  Math.abs(y - this._emptyArrayY) === 1 &&
                  this._emptyArrayX === x
                ) {
                  this._spriteMove = sprite;
                  this._spriteMoveX = 0;
                  this._spriteMoveY = mouseY;
                  this._omMouseDown = true;
                  this._spriteMoveArrayX = x;
                  this._spriteMoveArrayY = y;
                }
              }
            }
          }
        }
      }
    }
  };

  private _onmousedown = (e: MouseEvent) => {
    if (this._onShuffle) {
      return;
    }
    if (!this._isStart) {
      return;
    }

    const target = e.currentTarget as HTMLElement;
    const mouseX = e.pageX - target.offsetLeft;
    const mouseY = e.pageY - target.offsetTop;
    this._spriteMove = undefined;
    this._onmousedownNext(mouseX, mouseY);
  };

  async connectedCallback() {
    const shadow = this.shadowRoot;
    if (shadow) {
      this._gameLoop();

      const canvas = shadow.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        canvas.onmouseover = () => {
          if (this._onShuffle) {
            return;
          }
          if (!this._isStart) {
            return;
          }

          canvas.style.cursor = 'pointer';
        };

        canvas.onmouseout = () => {
          canvas.style.cursor = 'default';

          if (this._onShuffle) {
            return;
          }
          if (!this._isStart) {
            return;
          }

          this._omMouseDown = false;
          if (this._spriteMove) {
            this._spriteMove.dx = 0;
            this._spriteMove.dy = 0;
          }
        };

        canvas.addEventListener('touchstart', this._touchstart);
        canvas.addEventListener('mousedown', this._onmousedown);

        canvas.addEventListener('touchmove', this._touchmove);
        canvas.addEventListener('mousemove', this._onmousemove);

        canvas.addEventListener('touchend', this._touchend);
        canvas.addEventListener('mouseup', this._onmouseup);
      }
    }
  }

  private _initImage = async (image: string) => {
    const shadow = this.shadowRoot;
    if (shadow) {
      const canvas = shadow.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          const imgsl = await imageSlice(image, this._slen);
          ctx.clearRect(0, 0, this._slen, this._slen);

          let num = 0;
          for (let y = 0; y < this._numRowCol; y++) {
            for (let x = 0; x < this._numRowCol; x++) {
              if (x !== this._numRowCol - 1 || y !== this._numRowCol - 1) {
                this._sprites![x][y] = new Sprite({
                  name: `${++num}`,
                  x: (this._slen / this._numRowCol) * x,
                  y: (this._slen / this._numRowCol) * y,
                  width: this._slen / this._numRowCol,
                  height: this._slen / this._numRowCol,
                  data: imgsl.imageBitmap[x][y],
                });
              } else {
                this._emptyX = (this._slen / this._numRowCol) * x;
                this._emptyY = (this._slen / this._numRowCol) * y;
                this._emptyArrayX = x;
                this._emptyArrayY = y;
              }
            }
          }
        }
      }
    }
  };

  attributeChangedCallback(
    name: string,
    oldValue: string,
    newValue: string
  ): void {
    const shadow = this.shadowRoot;
    if (shadow) {
      if (name === 'image') {
        this._initImage(newValue);
      }
    }
  }

  shuffle() {
    this._onShuffle = true;
    this._shuffle();
    this._isStart = true;
    this._steps = 0;
    this._onShuffle = false;
  }
}
customElements.define('sliding-puzzle', SlidingPuzzle);
