import { parseArgs } from "@std/cli/parse-args";

import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import { CommandsPlugin } from "@plugins/commands";
import { DebugPlugin } from "@plugins/debug";
import { EditorPlugin } from "@plugins/editor";
import { ExitPlugin } from "@plugins/exit";
import { FooterPlugin } from "@plugins/footer";
import { HeaderPlugin } from "@plugins/header";
import { VTPlugin } from "@plugins/vt";
import { Alert } from "@widgets/alert";
import { Ask } from "@widgets/ask";
import { Palette } from "@widgets/palette";
import { Save } from "@widgets/save";

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
  handleRefresh(): void {
    resize();
    render();
  }

  async handleZen(): Promise<void> {
    zen = !zen;
    resize();
  }

  async handleExit(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (editorPlugin.widget.textChanged) {
      if (await ask.open("Save changes?")) {
        await saveFile();
      }
    }

    host.onExit();
  }

  async handlePalette(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    const cmd = await palette.open();

    editorPlugin.widget.setFocused(true);

    render();

    if (cmd) {
      await host.onCommand(cmd);
    }
  }

  async handleSave(): Promise<void> {
    editorPlugin.widget.setFocused(false);

    if (await saveFile()) {
      editorPlugin.widget.resetChanges();
    }

    editorPlugin.widget.setFocused(true);

    render();
  }

  async handleTheme(theme: themes.Theme): Promise<void> {
    alert.setTheme(theme);
    ask.setTheme(theme);
    palette.setTheme(theme);
    save.setTheme(theme);
  }

  async handleWhitespace(): Promise<void> {
    editorPlugin.widget.toggleWhitespace();
  }

  async handleWrap(): Promise<void> {
    editorPlugin.widget.toggleWrapped();
  }

  async handleCopy(): Promise<void> {
    editorPlugin.widget.copy();
  }

  async handleCut(): Promise<void> {
    editorPlugin.widget.cut();
  }

  async handlePaste(): Promise<void> {
    editorPlugin.widget.paste();
  }

  async handleUndo(): Promise<void> {
    editorPlugin.widget.undo();
  }

  async handleRedo(): Promise<void> {
    editorPlugin.widget.redo();
  }

  async handleSelectAll(): Promise<void> {
    editorPlugin.widget.selectAll();
  }
}();

const headerPlugin = new HeaderPlugin(host);
const footerPlugin = new FooterPlugin(host);
const editorPlugin = new EditorPlugin(host);
const debugPlugin = new DebugPlugin(host);

host.register(
  new VTPlugin(host),
  new ExitPlugin(host),
  headerPlugin,
  footerPlugin,
  editorPlugin,
  debugPlugin,
  new CommandsPlugin(host),
);

let zen = true;
let fileModified = false;
let fileName0: string | undefined;

const alert = new Alert();
const ask = new Ask();
const save = new Save();

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

const palette = new Palette({
  onInvalidate: () => host.handleRefresh(),
});

function resize(): void {
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

  palette.resize(editor.width, editor.height, editor.y, editor.x);

  {
    const w = std.clamp(60, 0, editor.width);
    const h = std.clamp(10, 0, editor.height);
    const y = editor.y + Math.trunc((editor.height - h) / 2);
    const x = editor.x + Math.trunc((editor.width - w) / 2);
    alert.resize(w, h, y, x);
  }

  {
    const w = std.clamp(60, 0, editor.width);
    const h = std.clamp(7, 0, editor.height);
    const y = editor.y + Math.trunc((editor.height - h) / 2);
    const x = editor.x + Math.trunc((editor.width - w) / 2);
    ask.resize(w, h, y, x);
  }

  {
    const w = std.clamp(60, 0, editor.width);
    const h = std.clamp(10, 0, editor.height);
    const y = editor.y + Math.trunc((editor.height - h) / 2);
    const x = editor.x + Math.trunc((editor.width - w) / 2);
    save.resize(w, h, y, x);
  }
}

function render(): void {
  const t0 = performance.now();

  vt.sync.bsu();
  vt.buf.write(vt.cursor.hide);

  host.onRender();

  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  debugPlugin.widget.props.renderTime = performance.now() - t0;
}

async function loadFile(fileName: string): Promise<void> {
  try {
    for await (const text of files.load(fileName)) {
      editorPlugin.widget.append(text);
    }

    fileName0 = fileName;
    headerPlugin.widget.props.fileName = fileName;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      await alert.open(err);

      host.onExit();
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
    await alert.open(err);

    return await saveFileAs();
  }
}

async function saveFileAs(): Promise<boolean> {
  while (true) {
    const fileName = await save.open(fileName0 ?? "");
    if (!fileName) {
      return false;
    }

    try {
      await files.save(fileName, editorPlugin.widget.read());

      fileName0 = fileName;
      headerPlugin.widget.props.fileName = fileName;

      return true;
    } catch (err) {
      await alert.open(err);
    }
  }
}

host.onStart();

const fileNameArg = typeof args._[0] === "string" ? args._[0] : undefined;
if (fileNameArg) {
  await loadFile(fileNameArg);
}

editorPlugin.widget.setFocused(true);
editorPlugin.widget.resetChanges();
editorPlugin.widget.resetCursor();

await host.handleTheme(themes.Themes.Default);
await host.onCommand({ name: "Theme", data: "Default" });

resize();

while (true) {
  render();

  const key = await vt.readKey();

  if (!await host.onKey(key)) {
    editorPlugin.widget.onKey(key);
  }
}
