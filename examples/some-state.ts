import { signal } from "@preact/signals-core";

export const myList = signal([
  {
    text: "Hello, world!",
  },
  {
    text: "Another item",
  },
  {
    text: "Yet Another item",
  },
]);

export const actions = {
  addItem(text: string) {
    myList.value = [
      ...myList.value,
      { text },
    ]
  },
  delete(i:number) {
    myList.value = myList.value.filter((_el, index) => index !== i)
  }
}
