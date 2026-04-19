import { parseArgs } from "@std/cli/parse-args";

import * as files from "@libs/files";
import * as plugins from "@libs/plugins";
import * as std from "@libs/std";
import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import { Commands } from "@plugins/commands";
import { Exit } from "@plugins/exit";
import { VT } from "@plugins/vt";
import { Alert } from "@widgets/alert";
import { Ask } from "@widgets/ask";
import { Debug } from "@widgets/debug";
import { Editor } from "@widgets/editor";
import { Footer } from "@widgets/footer";
import { Header } from "@widgets/header";
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

    header.props.disabled = zen;
    footer.props.disabled = zen;
    editor.toggleIndex();

    resize();
  }

  async handleExit(): Promise<void> {
    editor.setFocused(false);

    if (editor.textChanged) {
      if (await ask.open("Save changes?")) {
        await saveFile();
      }
    }

    host.exit();
  }

  async handlePalette(): Promise<void> {
    editor.setFocused(false);

    const cmd = await palette.open();

    editor.setFocused(true);

    render();

    if (cmd) {
      await host.handleCommand(cmd);
    }
  }

  async handleSave(): Promise<void> {
    editor.setFocused(false);

    if (await saveFile()) {
      editor.resetChanges();
    }

    editor.setFocused(true);

    render();
  }

  async handleTheme(theme: themes.Theme): Promise<void> {
    alert.setTheme(theme);
    ask.setTheme(theme);
    debug.setTheme(theme);
    editor.setTheme(theme);
    footer.setTheme(theme);
    header.setTheme(theme);
    palette.setTheme(theme);
    save.setTheme(theme);
  }

  async handleDebug(): Promise<void> {
    debug.props.disabled = !debug.props.disabled;
  }

  async handleWhitespace(): Promise<void> {
    editor.toggleWhitespace();
  }

  async handleWrap(): Promise<void> {
    editor.toggleWrapped();
  }

  async handleCopy(): Promise<void> {
    editor.copy();
  }

  async handleCut(): Promise<void> {
    editor.cut();
  }

  async handlePaste(): Promise<void> {
    editor.paste();
  }

  async handleUndo(): Promise<void> {
    editor.undo();
  }

  async handleRedo(): Promise<void> {
    editor.redo();
  }

  async handleSelectAll(): Promise<void> {
    editor.selectAll();
  }
}();

host.register(
  new VT(host),
  new Exit(host),
  new Commands(host),
);

let zen = true;
let fileModified = false;
let fileName9: string | undefined;

const alert = new Alert();
const ask = new Ask();
const save = new Save();

const header = new Header({
  disabled: zen,
  fileName: "",
  fileModified,
});

const footer = new Footer({
  disabled: zen,
  ln: 0,
  col: 0,
  lnCount: 0,
});

const editor = new Editor({
  multiLine: true,
  onTextChange: () => {
    fileModified = editor.textChanged;
    header.props.fileModified = fileModified;
  },
  onCursorChange: (x) => {
    footer.props.ln = x.ln;
    footer.props.col = x.col;
    footer.props.lnCount = x.lnCount;
  },
  onKeyHandle: (x) => debug.props.inputTime = x,
});

const debug = new Debug({
  disabled: true,
  renderTime: 0,
  inputTime: 0,
});

const palette = new Palette({
  onInvalidate: () => host.handleRefresh(),
});

function resize(): void {
  const { columns, rows } = Deno.consoleSize();

  header.resize(columns, 1, 0, 0);
  footer.resize(columns, 1, rows - 1, 0);

  if (zen) {
    editor.resize(columns, rows, 0, 0);
  } else {
    editor.resize(columns, rows - 2, 1, 0);
  }

  {
    const w = std.clamp(30, 0, editor.width);
    const h = std.clamp(7, 0, editor.height);
    const y = editor.y + editor.height - h;
    const x = editor.x + editor.width - w;
    debug.resize(w, h, y, x);
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

  header.render();
  editor.render();
  footer.render();
  debug.render();

  vt.buf.write(vt.cursor.show);
  vt.buf.flush();
  vt.sync.esu();

  debug.props.renderTime = performance.now() - t0;
}

async function loadFile(fileName: string): Promise<void> {
  try {
    for await (const text of files.load(fileName)) {
      editor.append(text);
    }

    fileName9 = fileName;
    header.props.fileName = fileName;
  } catch (err) {
    if (!(err instanceof Deno.errors.NotFound)) {
      await alert.open(err);

      host.exit();
    }
  }
}

async function saveFile(): Promise<boolean> {
  if (!fileName9) {
    return await saveFileAs();
  }

  try {
    await files.save(fileName9, editor.read());

    return true;
  } catch (err) {
    await alert.open(err);

    return await saveFileAs();
  }
}

async function saveFileAs(): Promise<boolean> {
  while (true) {
    const fileName = await save.open(fileName9 ?? "");
    if (!fileName) {
      return false;
    }

    try {
      await files.save(fileName, editor.read());

      fileName9 = fileName;
      header.props.fileName = fileName;

      return true;
    } catch (err) {
      await alert.open(err);
    }
  }
}

host.start();

const fileNameArg = typeof args._[0] === "string" ? args._[0] : undefined;
if (fileNameArg) {
  await loadFile(fileNameArg);
}

editor.setFocused(true);
editor.resetChanges();
editor.resetCursor();

await host.handleTheme(themes.Themes.Default);

resize();

while (true) {
  render();

  const key = await vt.readKey();

  if (!await host.handleKey(key)) {
    editor.onKey(key);
  }
}
