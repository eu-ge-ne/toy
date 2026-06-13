import { parseArgs } from "@std/cli/parse-args";

import * as std from "@libs/std";

import { AlertModalPlugin } from "@plugins/alert-modal";
import { BufferPlugin } from "@plugins/buffer";
import { ConfirmModalPlugin } from "@plugins/confirm-modal";
import { DebugPlugin } from "@plugins/debug";
import { FilePlugin } from "@plugins/file";
import { FileNameModalPlugin } from "@plugins/file-name-modal";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { IOPlugin } from "@plugins/io";
import { PaletteModalPlugin } from "@plugins/palette-modal";
import { RuntimePlugin } from "@plugins/runtime";
import { ShortcutsPlugin } from "@plugins/shortcuts";
import { ThemesPlugin } from "@plugins/themes";
import { ViewPlugin } from "@plugins/view";
import { ZenPlugin } from "@plugins/zen";

const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(std.version);
  Deno.exit();
}

class Loader<T0 extends Record<PropertyKey, never>> {
  readonly #api: T0;

  constructor(api?: T0) {
    this.#api = api ?? {} as T0;
  }

  use<T1>(plugin: (_: T0) => T1): Loader<T0 & T1> {
    Object.assign(this.#api, plugin(this.#api));

    return new Loader(this.#api as T0 & T1);
  }

  build(): T0 {
    return this.#api;
  }
}

const api = new Loader()
  .use(BufferPlugin)
  .use(RuntimePlugin)
  .use(IOPlugin)
  .use(ThemesPlugin)
  .use(AlertModalPlugin)
  .use(ConfirmModalPlugin)
  .use(FileNameModalPlugin)
  .use(FilePlugin)
  .use(ZenPlugin)
  .use(ViewPlugin)
  .use(FooterPlugin)
  .use(HeaderPlugin)
  .use(PaletteModalPlugin)
  .use(ShortcutsPlugin)
  .use(DebugPlugin)
  .build();

await api.runtime.start();

api.io.resize();

if (typeof args._[0] === "string") {
  await api.file.open(args._[0]);
}

api.runtime.events.on("stop", -1000)(async (e) => {
  if (!e && api.buffer.modified) {
    if (await api.confirmModal.open("Save changes?")) {
      await api.file.save();
    }
  }
});

await api.io.loop(() => {});
