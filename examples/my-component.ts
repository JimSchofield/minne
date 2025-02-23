import { signal } from "@preact/signals-core";
import { Component, css, html } from "../src/component";

export default class MyComponent extends Component {
  getMountPoint() {
    return this.attachShadow({ mode: "open" })!;
  }

  static css = css`
    div {
      background: pink;
    }
  `;

  show = signal(false);

  date = this.convert(
    "my-date",
    (val: string) => new Date(val),
    // (val: Date) => val.toString(),
  );

  toggleShow = () => (this.show.value = !this.show.value);

  text = this.attribute("text-attr", true);

  changeText = (event: InputEvent) =>
    (this.text.value = (event.target as HTMLInputElement).value);

  renderText = () => {
    return html` <div>
      <button onclick=${this.toggleShow}>toggle</button>
      ${this.show.value
        ? html`<input
            type="this.text"
            .value=${this.text.value}
            oninput=${this.changeText}
          />`
        : null}
      ${this.text.value}
    </div>`;
  };

  handleDateChange = (event) => {
    this.date.value = event.target.valueAsDate;
  };

  renderDate = () =>
    html`<div>${this.date.value.toString()}</div>
      <div>
        <input
          type="date"
          oninput=${this.handleDateChange}
          .valueAsDate=${this.date.value}
        />
      </div>`;

  render() {
    return html`<div>${this.renderText()} ${this.renderDate()}</div> `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-component": MyComponent;
  }
}
