import { Widget } from "./widget.ts";

export abstract class Frame extends Widget {
  abstract render(): void;
}
