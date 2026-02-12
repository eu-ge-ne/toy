const EOL_RE = /\r?\n/gm;
const RE_LETTER = /\p{Letter}/v;
const RE_SEPARATOR = /\p{Separator}/v;
const RE_OTHER = /\p{Other}/v;

export class Grapheme {
  readonly isLetter: boolean;
  readonly isSeparator: boolean;
  readonly isOther: boolean;
  readonly isVisible: boolean;
  readonly isEol: boolean;

  constructor(
    readonly char: string,
    readonly bytes: Uint8Array,
    public width: number,
  ) {
    this.isLetter = RE_LETTER.test(char);
    this.isSeparator = RE_SEPARATOR.test(char);
    this.isOther = RE_OTHER.test(char);
    this.isVisible = !this.isSeparator && !this.isOther;
    this.isEol = EOL_RE.test(char);
  }
}
