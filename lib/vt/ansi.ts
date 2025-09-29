const encoder = new TextEncoder();

export const ST = "\x1b\\";

export function CSI(code: string): Uint8Array {
  return encoder.encode(`\x1b[${code}`);
}

export function OSC(code: string): Uint8Array {
  return encoder.encode(`\x1b]${code}`);
}
