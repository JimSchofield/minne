import { signal } from "@preact/signals";
import { Component, h } from "./component";
import { actions, myList } from "./some-state";

export default class MyList extends Component {
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
    MyList: MyList;
  }
}
