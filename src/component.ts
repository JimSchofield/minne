import { html, render, Renderable } from "lighterhtml";
import { effect, signal} from "@preact/signals-core";
export { html as h };

const identity = (t: any) => t;

const renderDispose = Symbol("render-dispose");
const onDestroy = Symbol("on-destroy");

export abstract class Component extends HTMLElement {
  [onDestroy]: Set<() => void> = new Set();

  styles = "";

  constructor() {
    super();

    if (this.constructor.styles) {
      this.attachStyles();
    }
  }

  attachStyles() {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replace(this.constructor.styles);

    const root = this.getMountPoint();

    if (root instanceof ShadowRoot) {
      root.adoptedStyleSheets = [
        ...root.adoptedStyleSheets,
        stylesheet,
      ];
    } else {
      document.adoptedStyleSheets = [
        ...document.adoptedStyleSheets,
        stylesheet,
      ];
    }
  }

  addDestroyer(cb: () => void) {
    this[onDestroy].add(cb);
  }

  getMountPoint(): HTMLElement | ShadowRoot {
    return this;
  }

  connectedCallback() {
    if ("render" in this) {
      this.render = render.bind(
        null,
        this.getMountPoint(),
        (this.render as () => Renderable).bind(this),
      );

      const destroyEffect = effect(this.render);
      this.addDestroyer(destroyEffect);
    }
  }

  destroy() {
    this[onDestroy].forEach(function (fn) {
      fn();
    });
  }

  disconnectedCallback() {
    this.destroy();
  }

  static define(componentTag: string) {
    if (this === Component) {
      throw new Error(
        "Cannot define Component class directly.  You must make your own web component by extending from this base class.",
      );
    }

    if (!customElements.get(componentTag)) {
      //@ts-expect-error `this` is not Component directly, we're fine here
      customElements.define(componentTag, this);
    }
  }

  convert<T>(
    attributeName: string,
    fromAttr: (val: string) => T,
    toAttr?: (val: T) => string,
  ) {
    return toAttr
      ? this.attribute(attributeName, true, fromAttr, toAttr)
      : this.attribute(attributeName, false, fromAttr);
  }

  attribute<T>(
    attr: string,
    reflect?: boolean,
    fromAttr: (val: string) => T = identity,
    toAttr: (val: T) => string = identity,
  ) {
    const sig = signal<string | T>(fromAttr(this.getAttribute(attr) ?? ""));

    if (reflect) {
      const disposeEffect = effect(() => {
        const currentAttr = this.getAttribute(attr);

        // Don't trigger if already equal
        if (currentAttr !== toAttr(sig.peek as T)) {
          this.setAttribute(attr, toAttr(sig.value as T));
        }
      });

      this.addDestroyer(disposeEffect);
    }

    const mo = new MutationObserver((list) => {
      for (const item of list) {
        if (item.attributeName === attr) {
          sig.value = fromAttr(this.getAttribute(attr) ?? "");
        }
      }
    });

    mo.observe(this, { attributes: true });

    this.addDestroyer(mo.disconnect.bind(mo));

    return sig;
  }
}
