const encoder = new TextEncoder();

const file = await Deno.open("./tmp/toy.log", {
  create: true,
  write: true,
  truncate: true,
});

async function log(
  level: string,
  data: unknown,
  message?: string,
): Promise<void> {
  const t = new Date().toLocaleTimeString(undefined, { hour12: false });
  const m = message ? ` ${message} ` : " ";
  const d = JSON.stringify(data, undefined, 4);
  const line = `${t} [${level}]${m}${d}\n`;
  const bytes = encoder.encode(line);
  let i = 0;

  while (i < bytes.byteLength) {
    i += await file.write(bytes.subarray(i));
  }

  await file.sync();
}

export async function info(data: unknown, message?: string): Promise<void> {
  await log("INFO", data, message);
}

export async function error(data: unknown, message?: string): Promise<void> {
  await log("ERROR", data, message);
}
