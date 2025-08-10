const encoder = new TextEncoder();

export type Span = [number];

type Chunks = (string | Uint8Array)[];

export function txt(x: string): Uint8Array {
  return encoder.encode(x);
}

export function* text(span: Span, ...xs: Chunks): Generator<Uint8Array> {
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

export function* center(span: Span, ...xs: Chunks): Generator<Uint8Array> {
  const w0 = Math.trunc((span[0] - chunks_length(xs)) / 2);
  if (w0 > 0) {
    span[0] -= w0;
    yield space(w0);
  }

  yield* text(span, ...xs);

  const w1 = span[0];
  if (w1) {
    span[0] = 0;
    yield space(w1);
  }
}

export function space(n: number): Uint8Array {
  return encoder.encode(` \x1b[${n - 1}b`);
}

function chunks_length(xs: Chunks): number {
  return xs.filter((x) => typeof x === "string")
    .reduce((a, x) => a + x.length, 0);
}
