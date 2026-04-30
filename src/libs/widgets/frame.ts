import { Widget } from "./widget.ts";

export abstract class Frame<Props = void> extends Widget<Props> {
  abstract render(): void;
}
