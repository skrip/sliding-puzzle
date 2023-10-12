import { LitElement, html, css } from 'lit';
import { property, customElement } from 'lit/decorators.js';
/* eslint-disable import/no-duplicates */
import './sliding-puzzle';
import { SlidingPuzzle } from './sliding-puzzle';
import './sliding-puzzle/hooray';
import { Hooray } from './sliding-puzzle/hooray';

@customElement('app-sliding-puzzle')
export class AppSlidingPuzzle extends LitElement {
  @property({ type: String }) header = 'Sliding Puzzle';

  @property({ type: String }) image = new URL(
    '../../../assets/image.jpeg',
    import.meta.url
  ).href;

  @property({ type: String }) steps = '0';

  static styles = css`
    :host {
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      font-size: calc(10px + 2vmin);
      color: #1a2b42;
      max-width: 960px;
      margin: 0 auto;
      text-align: center;
      background-color: var(--sliding-puzzle-background-color);
    }

    .main {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
    }

    .app-footer {
      font-size: calc(12px + 0.5vmin);
      align-items: center;
    }

    .app-footer a {
      margin-left: 5px;
    }

    .button {
      padding: 5px;
      border: 1px solid gray;
      background-color: #c1d8c3;
      cursor: pointer;
      color: #363062;
      font-size: 17px;
    }
    .button:hover {
      background-color: #6a9c89;
    }
  `;

  private _clickStart = () => {
    const slid = this.shadowRoot?.querySelector(
      'sliding-puzzle'
    ) as SlidingPuzzle;
    slid.shuffle();
    const start = this.shadowRoot?.querySelector('.start') as HTMLElement;
    start.style.visibility = 'hidden';
    const cimage = this.shadowRoot?.querySelector('.image') as HTMLElement;
    cimage.style.visibility = 'hidden';
    const cstep = this.shadowRoot?.querySelector('.step') as HTMLElement;
    cstep.style.visibility = 'visible';

    const hore = this.shadowRoot?.querySelector('app-horaay') as Hooray;
    if (hore) {
      hore.stop();
    }
  };

  private _fileChange = (e: Event) => {
    const target = e.currentTarget as HTMLInputElement;
    if (target.files) {
      if (target.files.length > 0) {
        this.image = URL.createObjectURL(target.files[0]);

        const hore = this.shadowRoot?.querySelector('app-horaay') as Hooray;
        if (hore) {
          hore.stop();
        }
      }
    }
  };

  private _onStep = (e: CustomEvent) => {
    if (e.detail.step) {
      this.steps = e.detail.step;
    }
  };

  private _onFinish = (e: CustomEvent) => {
    if (e.detail.finish) {
      const start = this.shadowRoot?.querySelector('.start') as HTMLElement;
      start.style.visibility = 'visible';
      const cimage = this.shadowRoot?.querySelector('.image') as HTMLElement;
      cimage.style.visibility = 'visible';
      const cstep = this.shadowRoot?.querySelector('.step') as HTMLElement;
      cstep.style.visibility = 'hidden';
      this.steps = '0';

      const hore = this.shadowRoot?.querySelector('app-horaay') as Hooray;
      if (hore) {
        hore.start();
      }
    }
  };

  firstUpdated() {
    const hore = this.shadowRoot?.querySelector('app-horaay') as Hooray;
    if (hore) {
      hore.stop();
    }
  }

  render() {
    return html`
      <app-horaay></app-horaay>
      <div class="main">
        <h1>${this.header}</h1>
        <sliding-puzzle
          @onFinish="${this._onFinish}"
          @onStep="${this._onStep}"
          image="${this.image}"
        ></sliding-puzzle>
        <button
          style="margin-top: 24px; margin-bottom: 10px;"
          class="button start"
          @click="${this._clickStart}"
        >
          Start
        </button>
        <label class="button image">
          Load Your Image
          <input
            accept="image/*"
            @change="${this._fileChange}"
            type="file"
            style="display: none;"
          />
        </label>
        <div class="step" style="visibility: hidden; font-size: 15px;">
          Steps : ${this.steps}
        </div>
      </div>

      <p class="app-footer">Made with love by me</p>
    `;
  }
}
