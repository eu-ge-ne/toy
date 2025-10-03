import { Key } from "@eu-ge-ne/kitty-keys";

const keys: Key[] = [];
let keysWait = Promise.withResolvers();
let keysWaitResolved = false;

export async function listenStdin(): Promise<void> {
  const buf = new Uint8Array(1024);

  while (true) {
    const n = await Deno.stdin.read(buf);
    if (n === null) {
      continue;
    }

    let bytes = buf.subarray(0, n);

    while (bytes.length > 0) {
      const result = Key.parse(bytes);
      if (result) {
        keys.push(result[0]);
        if (!keysWaitResolved) {
          keysWait.resolve(undefined);
          keysWaitResolved = true;
        }

        bytes = bytes.subarray(result[1]);
        continue;
      }

      let n = bytes.indexOf(0x1b, 1);
      if (n < 0) {
        n = bytes.length;
      } else {
        n += 1;
      }
      bytes = bytes.subarray(n);
    }
  }
}

export async function readKey(): Promise<Key> {
  await keysWait.promise;

  const key = keys.shift()!;

  if (keys.length === 0) {
    keysWait = Promise.withResolvers();
    keysWaitResolved = false;
  }

  return key;
}
