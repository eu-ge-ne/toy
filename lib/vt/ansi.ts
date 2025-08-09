const encoder = new TextEncoder();

export function esc(code: string): Uint8Array {
  return encoder.encode(`\x1b${code}`);
}

export function csi(code: string): Uint8Array {
  return encoder.encode(`\x1b[${code}`);
}

const csi_cache: Record<number, Uint8Array> = {};

export function csi_cached(key: number, code: () => string): Uint8Array {
  let bytes = csi_cache[key];

  if (!bytes) {
    bytes = csi_cache[key] = csi(code());
  }

  return bytes;
}
