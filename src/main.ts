import { parseArgs } from "@std/cli/parse-args";

import * as std from "@libs/std";

import { AlertModalPlugin } from "@plugins/alert-modal";
import { BufferPlugin } from "@plugins/buffer";
import * as confirmModal from "@plugins/confirm-modal";
import * as debug from "@plugins/debug";
import * as fileNameModal from "@plugins/file-name-modal";
import * as footer from "@plugins/footer";
import * as header from "@plugins/header";
import * as io from "@plugins/io";
import * as main from "@plugins/main";
import * as paletteModal from "@plugins/palette-modal";
import * as runtime from "@plugins/runtime";
import * as shortcuts from "@plugins/shortcuts";
import * as themes from "@plugins/themes";
import * as views from "@plugins/views";
import * as zen from "@plugins/zen";

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
  .use(runtime.plugin)
  .use(io.plugin)
  .use(themes.plugin)
  .use(AlertModalPlugin)
  .use(confirmModal.plugin)
  .use(fileNameModal.plugin)
  .use(main.plugin)
  .use(zen.plugin)
  .use(views.plugin)
  .use(footer.plugin)
  .use(header.plugin)
  .use(paletteModal.plugin)
  .use(shortcuts.plugin)
  .use(debug.plugin)
  .build();

await api.runtime.start();

api.io.resize();

if (typeof args._[0] === "string") {
  await api.main.open(args._[0]);
}

api.runtime.events.on("stop", -1000)(async (e) => {
  if (!e && api.buffer.modified) {
    if (await api.confirmModal.open("Save changes?")) {
      await api.main.save();
    }
  }
});

await api.io.loop(() => {});
