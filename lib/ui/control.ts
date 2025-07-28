import { Area } from "./area.ts";

export abstract class Control {
  enabled = false;

  area!: Area;

  constructor(protected parent?: Control) {
  }

  resize(area: Area): void {
    this.area = area;
  }

  abstract render(): void;
}
