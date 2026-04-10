export abstract class Widget {
  width = 0;
  height = 0;
  y = 0;
  x = 0;

  protected children: Record<string, Widget> = {};

  resize(w: number, h: number, y: number, x: number): void {
    this.width = w;
    this.height = h;
    this.y = y;
    this.x = x;

    this.resizeChildren();
  }

  protected resizeChildren(): void {
  }
}
