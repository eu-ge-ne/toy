import { Key } from "@lib/kitty";

const buf = new Uint8Array(1024);
let i = 0;

export async function readKey(): Promise<Key> {
  while (true) {
    const data = buf.subarray(0, i);
    const parsed = Key.parse(data);

    if (parsed) {
      const chunk = data.subarray(parsed[1]);
      buf.set(chunk);
      i = chunk.byteLength;

      return parsed[0];
    }

    const n = await Deno.stdin.read(buf.subarray(i));
    if (typeof n === "number") {
      i += n;
    }
  }
}

const dec = new TextDecoder();

export function readRegExp(re: RegExp): RegExpMatchArray {
  for (let i = 0; i < 100; i += 1) {
    const data = buf.subarray(0, i);
    const match = dec.decode(data).match(re);

    if (match) {
      const chunk = data.subarray(match.index! + match[0].length);
      buf.set(chunk);
      i = chunk.byteLength;

      return match;
    }

    const n = Deno.stdin.readSync(buf.subarray(i));
    if (typeof n === "number") {
      i += n;
    }
  }

  throw new Error(`readRegExp error: [${buf.subarray(0, i)}]`);
}
