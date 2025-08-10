const encoder = new TextEncoder();

type Chunks = (string | Uint8Array)[];

export type Span = [number];

export function txt(x: string): Uint8Array {
  return encoder.encode(x);
}

export function* text(
  span: Span,
  align: "left" | "center",
  ...xs: Chunks
): Generator<Uint8Array> {
  if (align === "center") {
    const len = xs.filter((x) => typeof x === "string").reduce(
      (a, x) => a + x.length,
      0,
    );
    const w0 = Math.trunc((span[0] - len) / 2);
    if (w0 > 0) {
      span[0] -= w0;
      yield space(w0);
    }
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

  if (align === "center") {
    const w1 = span[0];
    if (w1) {
      span[0] = 0;
      yield space(w1);
    }
  }
}

export function space(n: number): Uint8Array {
  return encoder.encode(` \x1b[${n - 1}b`);
}
