import { signal } from "@preact/signals-core";
import { Component, html } from "../lib/component";

class ChildComponent extends Component {
  publicProperty = this.publicReactive("publicProperty", "Default");

  render() {
    return html`<div>${this.publicProperty.value}</div>`;
  }
}
ChildComponent.define("child-component");

export default class AdultComponent extends Component {
  text = signal("Passed initial value");

  render() {
    return html`
      <div>
        <div>Adult</div>
        <div>
          <input
            type="text"
            .value=${this.text.value}
            oninput=${(event: InputEvent) =>
              (this.text.value = (event.target as HTMLInputElement).value)}
          />
          <child-component .publicProperty=${this.text.value}></child-component>
        </div>
      </div>
    `;
  }
}
