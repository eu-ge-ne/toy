import { Area } from "./area.ts";

export abstract class Component implements Area {
  y = 0;
  x = 0;
  w = 0;
  h = 0;

  abstract layout(_: Area): void;
  abstract render(): void;
}
