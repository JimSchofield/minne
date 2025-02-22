import { signal } from "@preact/signals-core";
import { Component, h } from "./component";
import { actions, myList } from "./some-state";

export default class MyList extends Component {
  static styles = this.css`
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
    return h`
<ul>
  ${myList.value.map((item, index) => {
    return h`<li>${item.text} - <button onclick=${actions.delete.bind(null, index)}>delete</button></li>`;
  })}
</ul>
<input type="text" .value=${this.text.value} oninput=${() => (this.text.value = event.target.value)} />
<button onclick=${this.add.bind(this)}>add</button>
`;
  }
}

declare global {
  interface HTMLElementTagNameMap {
    "my-list": MyList;
  }
}
