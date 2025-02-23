import { signal } from "@preact/signals-core";
import { Component, html } from "../src/component";
import { fc } from "../src/fc";

class ChildComponent extends Component {
  count = signal(0);

  constructor() {
    super();

    setInterval(() => this.count.value++, 1000);
  }

  render() {
    return html`<div>child: ${this.count.value}</div>`;
  }
}
ChildComponent.define("child-");

const OtherChild = () => {
  const text = signal("");
  const count = signal(0);

  const handleInput = (event: InputEvent) =>
    (text.value = (event.target as HTMLInputElement).value);

  setInterval(() => count.value++, 1000);

  return () => {
    console.log("fc child render");
    return html` <div>
      <div>FC child: ${count.value}</div>
      <div>FC child: ${text.value}</div>
      <input type="text" oninput=${handleInput} .value=${text.value} />
    </div>`;
  };
};

export default class AdultComponent extends Component {
  toggle = signal(false);

  render() {
    console.log("adult render");
    return html`
      <div>
        <div>Adult</div>
        <child- />
        <div>
          ${this.toggle.value && fc(OtherChild())}
          <button onclick=${() => this.toggle.value = !this.toggle.value}>toggle</button>
          </div>
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "adult-": AdultComponent;
  }
}
