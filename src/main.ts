import { parseArgs } from "@std/cli/parse-args";

import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";
import { AlertPlugin } from "@plugins/alert";
import { AskPlugin } from "@plugins/ask";
import { AskFileNamePlugin } from "@plugins/ask-file-name";
import { CommandsPlugin } from "@plugins/commands";
import { DebugPlugin } from "@plugins/debug";
import { EditorPlugin } from "@plugins/editor";
import { ExitPlugin } from "@plugins/exit";
import { FilesPlugin } from "@plugins/files";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { PalettePlugin } from "@plugins/palette";
import { VTPlugin } from "@plugins/vt";

import deno from "../deno.json" with { type: "json" };

export const args = parseArgs(Deno.args, {
  boolean: ["version"],
  alias: {
    version: "v",
  },
});

if (args.version) {
  console.log(`toy ${deno.version} (deno ${Deno.version.deno})`);
  Deno.exit();
}

const host = new class extends plugins.Host {
  async exit(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (editorPlugin.widget.textChanged) {
      if (await host.emitAsk("Save changes?")) {
        await host.emitFileSave();
      }
    }

    host.emitStop();
  }

  async save(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (await host.emitFileSave()) {
      editorPlugin.widget.resetChanges();
    }

    editorPlugin.widget.setFocused(true);

    host.emitRender();
  }
}();

const editorPlugin = new EditorPlugin(host);

host.register(
  new VTPlugin(host),
  new ExitPlugin(host),
  new FilesPlugin(host),
  new CommandsPlugin(host),
  new HeaderPlugin(host),
  new FooterPlugin(host),
  editorPlugin,
  new DebugPlugin(host),
  new AskPlugin(host),
  new AlertPlugin(host),
  new PalettePlugin(host),
  new AskFileNamePlugin(host),
);

host.emitStart();
host.emitResize();

await host.emitCommand({ name: "Theme", data: "Default" });

if (typeof args._[0] === "string") {
  await host.emitFileOpen(args._[0]);
}

while (true) {
  host.emitRender();

  const key = await vt.readKey();

  await host.emitKey(key);
}
