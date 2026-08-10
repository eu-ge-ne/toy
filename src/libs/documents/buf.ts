export class Buf {
  text = "";
  eols: { start: number; end: number }[] = [];

  constructor(text: string) {
    this.append(text);
  }

  get isGrowable(): boolean {
    return this.text.length < 100;
  }

  append(text: string): void {
    if (!this.isGrowable) {
      throw new Error("Buf is not growable");
    }

    for (const m of text.matchAll(/\r?\n/gm)) {
      this.eols.push({
        start: this.text.length + m.index,
        end: this.text.length + m.index + m[0].length,
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
