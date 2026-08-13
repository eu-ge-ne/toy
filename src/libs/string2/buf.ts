export class Buf {
  text = "";
  eols: { start: number; end: number }[] = [];

  constructor(text: string) {
    this.append(text);
  }

  get isGrowable(): boolean {
    return this.text.length < 1024;
  }

  append(text: string): void {
    if (!this.isGrowable) {
      throw new Error("Buf is not growable");
    }

    const l = this.text.length;

    /*
    for (const m of text.matchAll(/\r?\n/gm)) {
      this.eols.push({
        start: l + m.index,
        end: l + m.index + m[0].length,
      });
    }
    */

    let i = 0;

    while (true) {
      let start = text.indexOf("\n", i);
      if (start < 0) {
        break;
      }

      const end = start + 1;

      if (text[start - 1] === "\r") {
        start -= 1;
      }

      this.eols.push({ start: l + start, end: l + end });

      i = end;
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
