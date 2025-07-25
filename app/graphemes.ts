import { GraphemePool } from "@lib/grapheme";

export const editor_graphemes = new GraphemePool({
  overrides: new Map([
    ["\u0000", "␀"],
    ["\u0001", "␁"],
    ["\u0002", "␂"],
    ["\u0003", "␃"],
    ["\u0004", "␄"],
    ["\u0005", "␅"],
    ["\u0006", "␆"],
    ["\u0007", "␇"],
    ["\u0008", "␈"],

    //["\u0009", "␉"],
    ["\u0009", "\u2022\u2022\u2022\u2022"],

    ["\u000a", "␊"],
    ["\u000b", "␋"],
    ["\u000c", "␌"],
    ["\u000d", "␍"],
    ["\u000e", "␎"],
    ["\u000f", "␏"],
    ["\u0010", "␐"],
    ["\u0011", "␑"],
    ["\u0012", "␒"],
    ["\u0013", "␓"],
    ["\u0014", "␔"],
    ["\u0015", "␕"],
    ["\u0016", "␖"],
    ["\u0017", "␗"],
    ["\u0018", "␘"],
    ["\u0019", "␙"],
    ["\u001a", "␚"],
    ["\u001b", "␛"],
    ["\u001c", "␜"],
    ["\u001d", "␝"],
    ["\u001e", "␞"],
    ["\u001f", "␟"],

    //["\u0020", "␠"],
    ["\u0020", "\u2027"],

    ["\u007f", "␡"],
    ["\r\n", "␍␊"],
  ]),
});
