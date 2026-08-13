import { Buf } from "./buf.ts";

export class Slice {
  #start = 0;
  #end = 0;
  #eolStart = 0;
  #eolEnd = 0;

  constructor(start: number, end: number, eolStart: number, eolEnd: number) {
    this.#start = start;
    this.#end = end;
    this.#eolStart = eolStart;
    this.#eolEnd = eolEnd;
  }

  static create(buf: Buf, start: number, end: number): Slice {
    return new Slice(start, end, buf.charToLine(start), buf.charToLine(end));
  }

  clone(): Slice {
    return new Slice(this.#start, this.#end, this.#eolStart, this.#eolEnd);
  }

  get charCount(): number {
    return this.#end - this.#start;
  }

  get eolCount(): number {
    return this.#eolEnd - this.#eolStart;
  }

  get start(): number {
    return this.#start;
  }

  get end(): number {
    return this.#end;
  }

  get eolStart(): number {
    return this.#eolStart;
  }

  get eolEnd(): number {
    return this.#eolEnd;
  }

  setStart(buf: Buf, start: number): void {
    this.#start = start;

    this.#eolStart = buf.charToLine(start);
  }

  setEnd(buf: Buf, end: number): void {
    this.#end = end;

    this.#eolEnd = buf.charToLine(end);
  }
}
