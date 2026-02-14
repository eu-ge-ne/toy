import { Area } from "./area.ts";

export abstract class Component implements Area {
  w = 0;
  h = 0;

  y = 0;
  x = 0;

  constructor(readonly layout: (_: Area, __: Area) => void) {
  }

  abstract render(): void;
}
