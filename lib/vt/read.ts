import { Key } from "@lib/kitty";

const buf = new Uint8Array(1024);
let bufLen = 0;

function setBuf(chunk: Uint8Array): void {
  buf.set(chunk);
  bufLen = chunk.byteLength;
}

function appendToBuf(chunk: Uint8Array): void {
  buf.subarray(bufLen).set(chunk);
  bufLen += chunk.byteLength;
}

export async function readKey(): Promise<Key> {
  while (true) {
    const data = buf.subarray(0, bufLen);
    const parsed = Key.parse(data);

    if (parsed) {
      const tail = data.subarray(parsed[1]);
      setBuf(tail);

      return parsed[0];
    }

    const n = await Deno.stdin.read(buf.subarray(bufLen));
    if (typeof n === "number") {
      bufLen += n;
    }
  }
}

const syncBuf = new Uint8Array(1024);

export function readSync<T>(
  parser: (_: Uint8Array) => [T, number] | undefined,
): T {
  for (let a = 0; a < 50; a += 1) {
    const n = Deno.stdin.readSync(syncBuf);
    if (typeof n !== "number") {
      continue;
    }

    const data = syncBuf.subarray(0, n);

    const parsed = parser(data);
    if (parsed) {
      const tail = data.subarray(parsed[1]);
      appendToBuf(tail);

      return parsed[0];
    }

    appendToBuf(data);
  }

  throw new Error(`parse error: [${buf.subarray(0, bufLen)}]`);
}
