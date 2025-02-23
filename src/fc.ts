import { effect } from "@preact/signals-core";
import { Hole, render } from "lighterhtml";

const finalizationRegistry = new FinalizationRegistry((entity: () => void) => {
  console.log("unregistering ", entity);
  entity();
});

export const fc = (child: () => Hole) => {
  const el = document.createElement("div");
  el.style.display = "contents";

  const ref = new WeakRef(el);
  // const renderWeak = new WeakRef(render.bind(null, ref.deref()!, child));

  // While we can't guarantee  garbage collecting will happen when we want,
  // we can at least unsub when this element is removed and a subbed effect
  // is triggered
  const unsub = effect(() => {
    const r = ref.deref();
    if (r) {
      render(r, child);
    } else {
      console.log("unsubbing")
      unsub();
    }
  });

  // finalizationRegistry.register(ref.deref(), unsub);

  return el;
};
