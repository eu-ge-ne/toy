export class Area {
  readonly x1: number;
  readonly y1: number;

  constructor(
    readonly x0: number,
    readonly y0: number,
    readonly w: number,
    readonly h: number,
  ) {
    this.w = w;
    this.h = h;
    this.x1 = x0 + w;
    this.y1 = y0 + h;
  }

  static from_screen(): Area {
    const { columns, rows } = Deno.consoleSize();
    return new Area(0, 0, columns, rows);
  }

  div_x(w: number): [Area, Area] {
    if (w < 0) {
      w = this.w + w;
    }

    return [
      new Area(this.x0, this.y0, w, this.h),
      new Area(this.x0 + w, this.y0, this.w - w, this.h),
    ];
  }

  div_y(h: number): [Area, Area] {
    if (h < 0) {
      h = this.h + h;
    }

    return [
      new Area(this.x0, this.y0, this.w, h),
      new Area(this.x0, this.y0 + h, this.w, this.h - h),
    ];
  }

  center(area: Area): Area {
    const w = Math.min(area.w, this.w);
    const h = Math.min(area.h, this.h);

    const x0 = Math.trunc((this.w - w) / 2);
    const y0 = Math.trunc((this.h - h) / 2);

    return new Area(x0, y0, w, h);
  }
}
