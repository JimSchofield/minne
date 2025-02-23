import { effect } from "@preact/signals-core";
import { Hole, render } from "lighterhtml";

const finalizationRegistry = new FinalizationRegistry((entity: () => void) => {
  console.log("unsubbing");
  entity();
});

const el = document.createElement("div");
el.style.display = "contents";

export const fc = (child: () => Hole) => {
  const r = new WeakRef(el.cloneNode());
  let firstRender = true;

  const unsub = effect(() => {
    const weakEl = r.deref();

    if (firstRender && weakEl) {
      // First render el is not in dom, but go ahead and render
      render.call(null, weakEl, child);
      firstRender = false;
    } else if (weakEl && weakEl.parentNode) {
      // Normally this is the effect when in the DOM
      render.call(null, weakEl, child);
    } else {
      // If no parent node, don't even wait until garbage collection
      // This effect is being called when the element is not
      // mounted, so we should clean up
      unsub();
      finalizationRegistry.unregister(r.deref()!);
    }
  });

  finalizationRegistry.register(r.deref()!, unsub);

  return r.deref()!;
};
