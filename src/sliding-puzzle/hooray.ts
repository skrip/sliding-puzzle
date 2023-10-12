import { Particle } from './particle';

const css = String.raw;

export class Hooray extends HTMLElement {
  private _fps = 30;

  private _isStart = false;

  private _particles?: Array<Particle> = Array.from({ length: 1000 });

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = css`
      canvas {
        border: 1px solid black;
        position: fixed;
        top: 0;
        left: 0;
        pointer-events: none;
      }
    `;

    const template = document.createElement('template');
    template.innerHTML = /* HTML */ `
      <canvas
        width="${window.innerWidth}"
        height="${window.innerHeight}"
      ></canvas>
    `;

    shadow.append(style, template.content.cloneNode(true));

    if (this._particles) {
      for (let x = 0; x < this._particles.length; x++) {
        this._particles[x] = new Particle({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }
    }
  }

  private _render() {
    const shadow = this.shadowRoot;
    if (shadow) {
      const canvas = shadow.querySelector('canvas') as HTMLCanvasElement;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, window.innerWidth, window.innerHeight);
          if (this._isStart) {
            if (this._particles) {
              for (let x = 0; x < this._particles.length; x++) {
                this._particles[x].draw(ctx);
              }
            }
          }
        }
      }
    }
  }

  async connectedCallback() {
    const shadow = this.shadowRoot;
    if (shadow) {
      this._gameLoop();
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

  start() {
    this._isStart = true;
  }

  stop() {
    this._isStart = false;
  }
}
customElements.define('app-horaay', Hooray);
