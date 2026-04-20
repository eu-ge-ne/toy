import { parseArgs } from "@std/cli/parse-args";

import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as vt from "@libs/vt";
import { AlertPlugin } from "@plugins/alert";
import { AskPlugin } from "@plugins/ask";
import { CommandsPlugin } from "@plugins/commands";
import { DebugPlugin } from "@plugins/debug";
import { EditorPlugin } from "@plugins/editor";
import { ExitPlugin } from "@plugins/exit";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { PalettePlugin } from "@plugins/palette";
import { SavePlugin } from "@plugins/save";
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
      if (await askPlugin.widget.open("Save changes?")) {
        await saveFile();
      }
    }

    host.emitExit();
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
const askPlugin = new AskPlugin(host);
const alertPlugin = new AlertPlugin(host);
const palettePlugin = new PalettePlugin(host);
const savePlugin = new SavePlugin(host);

host.register(
  new VTPlugin(host),
  new ExitPlugin(host),
  new CommandsPlugin(host),
  new HeaderPlugin(host),
  new FooterPlugin(host),
  editorPlugin,
  new DebugPlugin(host),
  askPlugin,
  alertPlugin,
  palettePlugin,
  savePlugin,
);

let fileModified = false;
let fileName0: string | undefined;

editorPlugin.widget.props.onTextChange = () => {
  fileModified = editorPlugin.widget.textChanged;
  if (fileModified) {
    host.emitDocContentChange();
  } else {
    host.emitDocContentReset();
  }
};

async function loadFile(fileName: string): Promise<void> {
  try {
    for await (const text of files.load(fileName)) {
      editorPlugin.widget.append(text);
    }

    fileName0 = fileName;
    host.emitDocNameChange(fileName);
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      await alertPlugin.widget.open(err);

      host.emitExit();
    }
  }
}

async function saveFile(): Promise<boolean> {
  if (!fileName0) {
    return await saveFileAs();
  }

  try {
    await files.save(fileName0, editorPlugin.widget.read());

    return true;
  } catch (err) {
    await alertPlugin.widget.open(err);

    return await saveFileAs();
  }
}

async function saveFileAs(): Promise<boolean> {
  while (true) {
    const fileName = await savePlugin.widget.open(fileName0 ?? "");
    if (!fileName) {
      return false;
    }

    try {
      await files.save(fileName, editorPlugin.widget.read());

      fileName0 = fileName;
      host.emitDocNameChange(fileName);

      return true;
    } catch (err) {
      await alertPlugin.widget.open(err);
    }
  }
}

host.emitStart();
host.emitResize();

await host.emitCommand({ name: "Theme", data: "Default" });

const fileNameArg = typeof args._[0] === "string" ? args._[0] : undefined;
if (fileNameArg) {
  await loadFile(fileNameArg);
}

while (true) {
  host.emitRender();

  const key = await vt.readKey();

  await host.emitKey(key);
}
