const encoder = new TextEncoder();

export function write(...chunks: Uint8Array[]): void {
  for (const chunk of chunks) {
    for (let i = 0; i < chunk.length;) {
      i += Deno.stdout.writeSync(chunk.subarray(i));
    }
  }
}

export function write_spaces(n: number): Uint8Array {
  return encoder.encode(` \x1b[${n - 1}b`);
}

export function* write_text(
  span: [number],
  ...xs: (string | Uint8Array)[]
): Generator<Uint8Array> {
  for (let chunk of xs) {
    if (typeof chunk !== "string") {
      yield chunk;
      continue;
    }

    if (span[0] === 0) {
      break;
    }

    if (chunk.length > span[0]) {
      chunk = chunk.slice(0, span[0]);
    }

    yield encoder.encode(chunk);

    span[0] -= chunk.length;
  }
}

export function* write_text_center(
  span: [number],
  ...xs: (string | Uint8Array)[]
): Generator<Uint8Array> {
  const len = xs.filter((x) => typeof x === "string").reduce(
    (a, x) => a + x.length,
    0,
  );
  const w0 = Math.trunc((span[0] - len) / 2);
  if (w0 > 0) {
    span[0] -= w0;
    yield write_spaces(w0);
  }

  for (let chunk of xs) {
    if (typeof chunk !== "string") {
      yield chunk;
      continue;
    }

    if (span[0] === 0) {
      break;
    }

    if (chunk.length > span[0]) {
      chunk = chunk.slice(0, span[0]);
    }

    yield encoder.encode(chunk);

    span[0] -= chunk.length;
  }

  const w1 = span[0];
  if (w1) {
    span[0] = 0;
    yield write_spaces(w1);
  }
}
