import { parseArgs } from "@std/cli/parse-args";

import * as files from "@libs/files";
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
        await saveFile();
      }
    }

    host.emitStop();
  }

  async save(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (await saveFile()) {
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

let fileModified = false;
let fileName0: string | undefined;

editorPlugin.widget.props.onTextChange = () => {
  fileModified = editorPlugin.widget.textChanged;
  if (fileModified) {
    host.emitDocChange();
  } else {
    host.emitDocReset();
  }
};

async function saveFile(): Promise<boolean> {
  if (!fileName0) {
    return await saveFileAs();
  }

  try {
    await files.save(fileName0, host.emitDocRead());

    return true;
  } catch (err) {
    const message = Error.isError(err) ? err.message : Deno.inspect(err);
    await host.emitAlert(message);

    return await saveFileAs();
  }
}

async function saveFileAs(): Promise<boolean> {
  while (true) {
    const newFileName = await host.emitAskFileName(fileName0 ?? "");
    if (!newFileName) {
      return false;
    }

    try {
      await files.save(newFileName, host.emitDocRead());

      fileName0 = newFileName;
      host.emitDocNameChange(newFileName);

      return true;
    } catch (err) {
      const message = Error.isError(err) ? err.message : Deno.inspect(err);
      await host.emitAlert(message);
    }
  }
}

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
