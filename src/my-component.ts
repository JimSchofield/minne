import { signal } from "@preact/signals-core";
import { Component, h } from "./component";

export default class MyComponent extends Component {
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
    return h`
      <div>
      <button onclick=${this.toggleShow}>toggle</button>
        ${
          this.show.value
            ? h`<input type="this.text" .value=${this.text.value} oninput=${this.changeText} />`
            : null
        }
${this.text.value}
</div>`;
  };

  handleDateChange = (event) => {
    this.date.value = event.target.valueAsDate;
  };

  renderDate = () => h`<div>
    ${this.date.value.toString()}
  </div>
<div><input type="date" oninput=${this.handleDateChange} .valueAsDate=${this.date.value} /></div>`;

  render() {
    return h`
      <div>
        ${this.renderText()}
        ${this.renderDate()}
      </div>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-component": MyComponent;
  }
}
