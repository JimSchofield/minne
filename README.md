# Minne

A signals-based web component framework that requires no decorators or build step.

This framework uses [lighterhtml](https://github.com/WebReflection/lighterhtml/tree/master) and [@preact/signals-core](https://github.com/preactjs/signals) to create dead simple web components. It's meant to be able to provide (almost) all the features in Lit with no decorators, simpler API, and abilities like functional components.

[Check out a Hello world on stackblitz!](https://stackblitz.com/edit/vitejs-vite-gcczrawg?file=src%2Fmain.ts)

## Why "minne"?

I'm from minnesota, and this is a "minne" framework ![Minnesota outline](./public/minnesota_blue.png)

## Installation:

`npm i minne`

## Components 🧩

Extend the `Component` class, and return an `html` tagged template literal in a `render()` function.

```ts
import { Component, html } from "minne";

class MyComponent extends Component {
  render() {
    return html`<div>Hello, world!</div>`;
  }
}

// Register the web component
MyComponent.define('my-component');

// And use in html:
<my-component></my-component>
```

## Reactivity 👂

Reactivity relies completely on Preact's signals. Signals are included in minne to minimize setup and imports. If a signal is used in the rendering of a minne component, the minne component will react.

This means [reactivity depends](https://preactjs.com/guide/v10/signals/#usage-example) on using `.value` in the template to register when re-renders need to take place.

```ts
import { Component, html, signal } from "minne";

class MyComponent extends Component {
  counter = signal(0);

  render() {
    return html`
      <div>Counter: ${this.signal.value}</div>
      <button onclick=${() => this.counter.value++}>+</button>
    `;
  }
}
```

`computed`, `effect`, `batched`, and `untracked` are all available to use.

This also means that state that are not primitives need to break their referental equality when updating. For example:

```ts
// This will not reassign the reference, and so the signal
// has no idea the array has been modified
signal.value.push(item);

// This re-assigns the array reference and will trigger udpates
signal.value = [...signal.value, item];
```

## Shadow root and shadow root options 👤

By default minne components create a shadow root on the host element. This is configurable by setting shadow root configuration object on `static shadowRoot`:

```ts
class MyComponent extends Component {
  static shadowRoot = {
    mode: "closed",
    delegateFocus: true,
    clonable: false,
    serializable: false,
    slotAssignment: "named",
  };

  render() {}
}
```

If you want no shadow root and want to mount on the host element, you can override `getMountPoint()`

```ts
class MyComponent extends Component {
  getMountPoint() {
    return this;
  }

  render() {} // renders without shadow dom on this (host element)
}
```

## Attributes 📋

Generally we can leverage `this.getAttribute` to get an attribute as an initial value:

```ts
class MyComponent extends Component {
  text = this.getAttribute("text-attr");
}
```

To make the text value reactive from the initial attribute, simply wrap in a signal:

```ts
class MyComponent extends Component {
  // seeds the initial value from the attribute value on component creation
  text = signal(this.getAttribute("text-attr"));

  // seeds initial value and reacts to attribute changes in DOM
  text = this.attribute("text-attr");

  // If you want the value reflected to the attr when it changes
  text = this.attribute("text-attr", true);
}
```

## Boolean Attributes ✅

We have a special helper method to handle boolean attributes:

```ts
class MyComponent extends Component {
  // Value is reactive and reacts to attribute changes in DOM
  disabled = this.booleanAttr("disabled");

  // If you want the value reflected to the attribute when it changes
  disabled = this.booleanAttr("disabled", true);
}
```

## Converters 🔄

Sometimes a property on a component needs to be serialized and deserialized when reactively set and got.

```ts
class MyComponent extends Component {
  // Providing a callback to parse the attribute string, and will
  // react to future attribute changes in the DOM
  // But changes will not be reflected
  date = this.converter("date-attr", (date: string) => new Date());

  // Providing a serialize function as well will make the value reflect to
  // the attribute in the DOM when the property changes
  date = this.converter(
    "date-attr",
    (date: string) => new Date(), // parser
    (date: Date) => date.toString(), // serializer
  );
}
```

## Styles 🎨

You can add a stylesheet using the css helper:

```ts
class MyComponent extends Component {
  static css = css`
    :host {
      display: block;
      background: orange;
    }
  `;
}
```

If the component is using a shadow DOM the stylesheet will be adopted at the shadow root level. Otherwise the stylesheet will be adopted on the whole `document`.

## Destroyers 💣

If you need to do some teardown functionality you can overwrite the `disconnectedCallback()` method (make sure to call super):

```ts
class MyComponent extends Component {
  disconnectedCallback() {
    super.disconnectedCallback();

    // Do teardown things
  }
}
```

An alternative is to register a destroyer. Destroyers are run on disconnected callback, but are more convenient to make. Just be aware when the function being passed needs a specific `this`.

```ts
class MyComponent extends Component {
  consructor() {
    super();

    window.addEventListener("resize", this.handleresize);

    this.addDestroyer(() =>
      window.removeEventListener("resize", this.handleresize),
    );
  }
}
```

## Function Components (Experimental 🧪)

These components are only available inside a traditional minne web component and are meant to be internal components. These components have their own lifecycle and signal subscriptions.

```ts
import { Component, fc, html, signal } from "minne";

const MyCounter = (startAt: number = 0) => {
  const counter = signal(startAt);

  setInterval(() => counter.value++, 1000);

  return () => html`<div>Counter: ${counter.value}</div>`;
};

class TestComponent extends Component {
  render() {
    return html`<div>Parent Component</div>
      ${fc(MyCounter(77))}`;
  }
}
```
