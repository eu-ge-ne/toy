export async function save(
  fileName: string,
  text: Iterable<string>,
): Promise<void> {
  using file = await Deno.open(fileName, {
    create: true,
    write: true,
    truncate: true,
  });

  const encoder = new TextEncoderStream();
  const writer = encoder.writable.getWriter();

  encoder.readable.pipeTo(file.writable);

  for (const t of text) {
    await writer.write(t);
  }
}
