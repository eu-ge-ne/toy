export class Slice {
  constructor(readonly start: number, readonly end: number) {}

  get length(): number {
    return this.end - this.start;
  }
}
