import { Component, html } from "../lib/component";

export default class TestShadowRootFalse extends Component {
  static shadowRoot = false;

  render() {
    return html`<div>No Shadow root?</div>`;
  }
}
