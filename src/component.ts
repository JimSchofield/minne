import { html, render, Renderable } from "lighterhtml";
import { effect, signal } from "@preact/signals-core";
export { html };

const css = String.raw;
export { css };

const identity = (t: any) => t;

const onDestroy = Symbol("on-destroy");

export abstract class Component extends HTMLElement {
  [onDestroy]: Set<() => void> = new Set();

  mountPoint: Element | ShadowRoot;

  constructor() {
    super();

    if ("css" in this.constructor) {
      this.attachStyles(this.constructor.css as string);
    }

    if ("shadowRoot" in this.constructor) {
      this.getMountPoint = () => {
        return this.attachShadow(this.constructor.shadowRoot as ShadowRootInit);
      };
    }

    this.mountPoint = this.getMountPoint();
  }

  getMountPoint(): HTMLElement | ShadowRoot {
    return this.attachShadow({ mode: "open" });
  }

  attachStyles(styles: string) {
    const stylesheet = new CSSStyleSheet();
    stylesheet.replaceSync(styles);

    // Assign a title because we need to know if there's a stylesheet
    // being duplicated
    Object.defineProperty(stylesheet, "title", {
      // Arrow to capture `this` of the component
      get: () => {
        return this.constructor.name;
      },
    });

    const root =
      this.mountPoint instanceof ShadowRoot ? this.mountPoint : document;

    if (
      !root.adoptedStyleSheets.find(({ title }) => title === stylesheet.title)
    ) {
      root.adoptedStyleSheets = [...root.adoptedStyleSheets, stylesheet];
    }
  }

  addDestroyer(cb: () => void) {
    this[onDestroy].add(cb);
  }

  // Left to override by consumer
  render() {}

  connectedCallback() {
    if ("render" in this) {
      this.render = render.bind(
        null,
        this.mountPoint,
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
