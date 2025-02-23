import { signal } from "@preact/signals-core";
import { Component, css, html } from "../src/component";
import { actions, myList } from "./some-state";

export default class MyList extends Component {
  static css = css`
    my-list {
      display: block;
      background: navy;
      color: white;
    }
  `;

  text = signal("");

  add() {
    actions.addItem(this.text.value);
    this.text.value = "";
  }

  render() {
    return html`
      <ul>
        ${myList.value.map((item, index) => {
          return html`<li>
            ${item.text} -
            <button onclick=${actions.delete.bind(null, index)}>delete</button>
          </li>`;
        })}
      </ul>
      <input
        type="text"
        .value=${this.text.value}
        oninput=${() => (this.text.value = event.target.value)}
      />
      <button onclick=${this.add.bind(this)}>add</button>
    `;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-list": MyList;
  }
}
