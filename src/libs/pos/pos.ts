export class Pos {
  constructor(readonly ln: number, readonly col: number) {
  }

  clone(): Pos {
    return new Pos(this.ln, this.col);
  }
}
