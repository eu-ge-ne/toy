export const EOL_RE = /\r?\n/gm;

const RE_LETTER = /\p{Letter}/v;
const RE_SEPARATOR = /\p{Separator}/v;
const RE_OTHER = /\p{Other}/v;

const encoder = new TextEncoder();

export class Grapheme {
  readonly bytes: Uint8Array;
  readonly is_letter: boolean;
  readonly is_separator: boolean;
  readonly is_other: boolean;
  readonly is_whitespace: boolean;
  readonly is_eol: boolean;

  vt_width?: number;

  constructor(readonly seg: string, override = seg) {
    this.bytes = encoder.encode(override);

    this.is_letter = RE_LETTER.test(seg);
    this.is_separator = RE_SEPARATOR.test(seg);
    this.is_other = RE_OTHER.test(seg);
    this.is_whitespace = this.is_separator || this.is_other;
    this.is_eol = EOL_RE.test(seg);
  }
}
