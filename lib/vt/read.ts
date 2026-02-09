import { Key } from "@lib/kitty";

const buf = new Uint8Array(1024);
let i = 0;

export async function readKey(): Promise<Key> {
  while (true) {
    const data = await readAsync();

    const parsed = Key.parse(data);
    if (!parsed) {
      continue;
    }

    const chunk = data.subarray(parsed[1]);
    buf.set(chunk);
    i = chunk.byteLength;

    return parsed[0];
  }
}

const dec = new TextDecoder();

export function readRegExp(re: RegExp): RegExpMatchArray {
  for (let i = 0; i < 10; i += 1) {
    const data = readSync();

    const match = dec.decode(data).match(re);
    if (!match) {
      continue;
    }

    const chunk = data.subarray(match.index! + match[0].length);
    buf.set(chunk);
    i = chunk.byteLength;

    return match;
  }

  throw new Error(`readRegExp error: [${buf.subarray(0, i)}]`);
}

async function readAsync(): Promise<Uint8Array> {
  const n = await Deno.stdin.read(buf.subarray(i));
  if (typeof n === "number") {
    i += n;
  }
  return buf.subarray(0, i);
}

function readSync(): Uint8Array {
  const n = Deno.stdin.readSync(buf.subarray(i));
  if (typeof n === "number") {
    i += n;
  }
  return buf.subarray(0, i);
}
