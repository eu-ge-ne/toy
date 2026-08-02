export class TextBuffer {
  text = "";
  eols: { start: number; end: number }[] = [];

  constructor(text: string) {
    this.append(text);
  }

  append(text: string): void {
    for (const x of text.matchAll(/\r?\n/gm)) {
      this.eols.push({
        start: this.text.length + x.index,
        end: this.text.length + x.index + x[0].length,
      });
    }

    this.text += text;
  }

  findEolIndex(index: number, a: number): number {
    let b = this.eols.length - 1;
    let i = 0;
    let start = 0;
    let end = 0;

    while (a <= b) {
      i = Math.trunc((a + b) / 2);
      start = this.eols[i]!.start;
      end = this.eols[i]?.end!;

      if (index >= end) {
        a = i + 1;
      } else if (index < start) {
        b = i - 1;
      } else if (index === start) {
        a = i;
        break;
      } else {
        throw new Error("Invalid argument");
      }
    }

    return a;
  }
}
