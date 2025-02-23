import { signal } from "@preact/signals-core";
import { Component, css, html } from "../src/component";

export default class TestingRef extends Component {
  ref?: HTMLElement;

  static css = css`
    p {
      background: lightblue;
    }

    ::slotted(p) {
      background: lightcoral;
    }

    .someclass::after {
      display: block;
      content: "Something";
    }
  `;

  isDisabled = signal(false);
  count = signal(0);

  get header() {
    return html` <h1>${this.count.value}</h1> `;
  }

  connectedCallback(): void {
    super.connectedCallback();

    setInterval(() => this.count.value++, 1000);
  }

  squeak = (event: MouseEvent) => {
    this.isDisabled.value = !this.isDisabled.value;
    (event.target as HTMLButtonElement).dispatchEvent(
      new CustomEvent("squeak-er", { bubbles: true }),
    );
  };

  render() {
    return html`
      <div
        ref=${(el: HTMLDivElement) => (this.ref = el)}
        onsqueak-er=${() => console.log("squeak")}
        aria-label=${null}
      >
        ${this.header}
        <p .dataset=${{ foo: "bar", num: 42 }}>lorem</p>
        <slot></slot>
        <button .disabled=${this.isDisabled.value}>Disabled?</button>
        <button onclick=${this.squeak}>squeak</button>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "testing-ref": TestingRef;
  }
}
