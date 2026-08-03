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

  indexToLine(index: number): number {
    let a = 0;
    let b = this.eols.length - 1;

    while (a <= b) {
      const i = Math.trunc((a + b) / 2);
      const start = this.eols[i]!.start;
      const end = this.eols[i]?.end!;

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
