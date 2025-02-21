import { Component, h } from "./component";

const css = String.raw;

export default class MyNumberComponent extends Component {
  static styles = css`
    my-number-component {
      display: block;
      padding: 1rem;
      color: blue;
      background: orange;
      font-size: 20px;
    }
  `;

  num = this.convert("my-number", Number, (num: number) => num.toString());

  setNumber = (event: InputEvent) => {
    this.num.value = parseInt((event.target as HTMLInputElement).value);
  };

  render() {
    return h`
  <div class="my-number-component">
    <div>My number ${this.num.value}</div>
    <input type="number" .value=${this.num.value} oninput=${this.setNumber} />
  </div>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-number-component": MyNumberComponent;
  }
}
