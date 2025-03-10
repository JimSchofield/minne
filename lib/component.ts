import { version } from "../package.json";
import { html, render, Renderable } from "lighterhtml";
import { effect, signal } from "@preact/signals-core";
export { html };

const css = String.raw;
export { css };

const identity = (t: any) => t;

const onDestroy = Symbol("on-destroy");

export abstract class Component extends HTMLElement {
  static brand = Symbol.for("minne-component");

  static version = version;

  [onDestroy]: Set<() => void> = new Set();

  constructor() {
    super();

    if ("css" in this.constructor) {
      this.attachStyles(this.constructor.css as string);
    }
  }

  publicReactive<T>(propertyKey: PropertyKey, value: T) {
    let s = signal(value);

    Object.defineProperty(this, propertyKey, {
      set(val: any) {
        // If already a preact signal, just use that
        if (
          typeof val === "object" &&
          "brand" in val &&
          val.brand === Symbol.for("preact-signals")
        ) {
          s = val;
        } else {
          // Otherwise, pass on value that triggers reactivity
          s.value = val;
        }
      },
      get() {
        return s;
      },
    });

    return s;
  }

  getMountPoint(): HTMLElement | ShadowRoot {
    if ("shadowRoot" in this.constructor) {
      const config = this.constructor.shadowRoot;

      if (config === false) {
        // if literally false, just attach to host
        return this;
      }

      return this.attachShadow(config as ShadowRootInit);
    } else {
      // Default is open shadow root
      return this.attachShadow({ mode: "open" });
    }
  }

  _mountPoint!: Element | ShadowRoot;

  get mountPoint() {
    if (this._mountPoint) {
      return this._mountPoint;
    }

    this._mountPoint = this.getMountPoint();

    return this._mountPoint;
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
  render() {
    return html``;
  }

  connectedCallback() {
    if ("render" in this) {
      // We need this difference, because if we don't we don't have a fallback
      // to render nothing in the base class `render`.
      // @ts-expect-error ignore difference in () => Hole and () => Node
      this.render = render.bind(
        null,
        this.mountPoint,
        (this.render as () => Renderable).bind(this),
      );

      try {
        // @ts-expect-error ignore render typing
        const destroyEffect = effect(this.render);

        this.addDestroyer(destroyEffect);
      } catch (e) {
        throw new Error(
          "Error rendering.  Did you forget to return an html tagged template?",
        );
      }
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
        if (currentAttr !== toAttr(sig.peek() as T)) {
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

  booleanAttr(attr: string, reflect?: boolean) {
    const isPresent = (attr: string) => this.getAttribute(attr) !== null;

    const bool = signal<boolean>(isPresent(attr));

    if (reflect) {
      const disposeEffect = effect(() => {
        const currentAttr = isPresent(attr);

        // Don't trigger if already equal
        if (currentAttr !== bool.value) {
          if (bool.value) {
            this.setAttribute(attr, "");
          } else {
            this.removeAttribute(attr);
          }
        }
      });

      this.addDestroyer(disposeEffect);
    }

    const mo = new MutationObserver((list) => {
      for (const item of list) {
        if (item.attributeName === attr) {
          bool.value = isPresent(attr);
        }
      }
    });

    mo.observe(this, { attributes: true });

    this.addDestroyer(mo.disconnect.bind(mo));

    return bool;
  }
}
