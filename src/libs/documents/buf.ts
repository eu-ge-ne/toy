export class Buf {
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

  charToLine(charIndex: number): number {
    let a = 0;
    let b = this.eols.length - 1;

    while (a <= b) {
      const i = Math.trunc((a + b) / 2);
      const eol = this.eols[i]!;

      if (charIndex >= eol.end) {
        a = i + 1;
        continue;
      }

      if (charIndex < eol.start) {
        if (i > 0) {
          b = i - 1;
          continue;
        } else {
          break;
        }
      }

      if (charIndex === eol.start) {
        a = i;
        break;
      }

      throw new Error("Invalid argument");
    }

    return a;
  }
}
