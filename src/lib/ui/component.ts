export abstract class Component {
  w = 0;
  h = 0;
  y = 0;
  x = 0;

  resize(w: number, h: number, y: number, x: number): void {
    this.w = w;
    this.h = h;
    this.y = y;
    this.x = x;

    this.layout();
  }

  abstract layout(): void;

  abstract render(): void;
}
