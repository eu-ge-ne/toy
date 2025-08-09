const encoder = new TextEncoder();

export function esc(code: string): Uint8Array {
  return encoder.encode(`\x1b${code}`);
}

export function csi(code: string): Uint8Array {
  return encoder.encode(`\x1b[${code}`);
}
