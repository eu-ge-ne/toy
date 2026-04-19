import { parseArgs } from "@std/cli/parse-args";

import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
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
  resize(): void {
    const { columns, rows } = Deno.consoleSize();

    headerPlugin.widget.resize(columns, 1, 0, 0);
    footerPlugin.widget.resize(columns, 1, rows - 1, 0);

    if (zen) {
      editorPlugin.widget.resize(columns, rows, 0, 0);
    } else {
      editorPlugin.widget.resize(columns, rows - 2, 1, 0);
    }

    const editor = editorPlugin.widget;

    {
      const w = std.clamp(30, 0, editor.width);
      const h = std.clamp(7, 0, editor.height);
      const y = editor.y + editor.height - h;
      const x = editor.x + editor.width - w;
      debugPlugin.widget.resize(w, h, y, x);
    }

    palettePlugin.widget.resize(
      editor.width,
      editor.height,
      editor.y,
      editor.x,
    );

    {
      const w = std.clamp(60, 0, editor.width);
      const h = std.clamp(10, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      alertPlugin.widget.resize(w, h, y, x);
    }

    {
      const w = std.clamp(60, 0, editor.width);
      const h = std.clamp(7, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      askPlugin.widget.resize(w, h, y, x);
    }

    {
      const w = std.clamp(60, 0, editor.width);
      const h = std.clamp(10, 0, editor.height);
      const y = editor.y + Math.trunc((editor.height - h) / 2);
      const x = editor.x + Math.trunc((editor.width - w) / 2);
      savePlugin.widget.resize(w, h, y, x);
    }
  }

  render(): void {
    const t0 = performance.now();

    vt.sync.bsu();
    vt.buf.write(vt.cursor.hide);

    host.emitRender();

    vt.buf.write(vt.cursor.show);
    vt.buf.flush();
    vt.sync.esu();

    debugPlugin.widget.props.renderTime = performance.now() - t0;
  }

  async zen(): Promise<void> {
    zen = !zen;
    host.resize();
  }

  async exit(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (editorPlugin.widget.textChanged) {
      if (await askPlugin.widget.open("Save changes?")) {
        await saveFile();
      }
    }

    host.emitExit();
  }

  async palette(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    const cmd = await palettePlugin.widget.open();

    editorPlugin.widget.setFocused(true);

    host.render();

    if (cmd) {
      await host.emitCommand(cmd);
    }
  }

  async save(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (await saveFile()) {
      editorPlugin.widget.resetChanges();
    }

    editorPlugin.widget.setFocused(true);

    host.render();
  }
}();

const headerPlugin = new HeaderPlugin(host);
const footerPlugin = new FooterPlugin(host);
const editorPlugin = new EditorPlugin(host);
const debugPlugin = new DebugPlugin(host);
const askPlugin = new AskPlugin(host);
const alertPlugin = new AlertPlugin(host);
const palettePlugin = new PalettePlugin(host);
const savePlugin = new SavePlugin(host);

host.register(
  new VTPlugin(host),
  new ExitPlugin(host),
  new CommandsPlugin(host),
  headerPlugin,
  footerPlugin,
  editorPlugin,
  debugPlugin,
  askPlugin,
  alertPlugin,
  palettePlugin,
  savePlugin,
);

let zen = true;
let fileModified = false;
let fileName0: string | undefined;

editorPlugin.widget.props.onTextChange = () => {
  fileModified = editorPlugin.widget.textChanged;
  headerPlugin.widget.props.modified = fileModified;
};

editorPlugin.widget.props.onCursorChange = (x) => {
  footerPlugin.widget.props.ln = x.ln;
  footerPlugin.widget.props.col = x.col;
  footerPlugin.widget.props.lnCount = x.lnCount;
};

editorPlugin.widget.props.onKeyHandle = (x) =>
  debugPlugin.widget.props.inputTime = x;

palettePlugin.widget.props.onInvalidate = () => {
  host.resize();
  host.render();
};

async function loadFile(fileName: string): Promise<void> {
  try {
    for await (const text of files.load(fileName)) {
      editorPlugin.widget.append(text);
    }

    fileName0 = fileName;
    headerPlugin.widget.props.fileName = fileName;
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
      headerPlugin.widget.props.fileName = fileName;

      return true;
    } catch (err) {
      await alertPlugin.widget.open(err);
    }
  }
}

host.emitStart();

const fileNameArg = typeof args._[0] === "string" ? args._[0] : undefined;
if (fileNameArg) {
  await loadFile(fileNameArg);
}

await host.emitCommand({ name: "Theme", data: "Default" });

host.resize();

while (true) {
  host.render();

  const key = await vt.readKey();

  await host.emitKey(key);
}
