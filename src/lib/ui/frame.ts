import { Widget } from "./widget.ts";

export abstract class Frame<T = unknown> extends Widget<T> {
  abstract render(): void;
}
