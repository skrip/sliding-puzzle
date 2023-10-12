import { html } from 'lit';
import { fixture, expect } from '@open-wc/testing';

import type { AppSlidingPuzzle } from '../src/app-sliding-puzzle.js';
import '../src/app-sliding-puzzle.js';

describe('AppSlidingPuzzle', () => {
  let element: AppSlidingPuzzle;
  beforeEach(async () => {
    element = await fixture(html`<app-sliding-puzzle></app-sliding-puzzle>`);
  });

  it('renders a h1', () => {
    const h1 = element.shadowRoot!.querySelector('h1')!;
    console.log(h1);
    expect(h1).to.exist;
    expect(h1.textContent).to.equal('Sliding Puzzle');
  });

  it('passes the a11y audit', async () => {
    await expect(element).shadowDom.to.be.accessible();
  });
});
