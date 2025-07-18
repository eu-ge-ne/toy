import { Area } from "./area.ts";

export abstract class Control {
  area!: Area;

  resize(area: Area): void {
    this.area = area;
  }

  abstract render(): void;
}
