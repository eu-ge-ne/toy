import { Area } from "./area.ts";

export abstract class Component implements Area {
  w = 0;
  h = 0;

  y = 0;
  x = 0;

  constructor(readonly resize: (_: Area, __: Area) => void) {
  }

  abstract render(): void;

  layout(p: Area): void {
    this.resize(this, p);
  }
}
