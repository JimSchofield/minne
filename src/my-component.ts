import { signal } from "@preact/signals";
import Component, { h } from "./component";

export default class MyComponent extends Component {
  text = this.attribute("text-attr");

  show = signal(false);

  toggleShow = () => (this.show.value = !this.show.value);

  changeText = (event: InputEvent) =>
    (this.text.value = (event.target as HTMLInputElement).value);

  render() {
    return h`
      <div>
        <button onclick=${this.toggleShow}>toggle</button>
        ${
          this.show.value
            ? h`<input type="this.text" .value=${this.text.value} oninput=${this.changeText} />`
            : null
        }
        ${this.text.value}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-component": MyComponent;
  }
}
