import * as theme from "@lib/theme";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert, set_alert_colors } from "@ui/alert";
import { Ask, set_ask_colors } from "@ui/ask";
import { Debug, set_debug_colors } from "@ui/debug";
import { Editor, set_editor_colors } from "@ui/editor";
import { Footer, set_footer_colors } from "@ui/footer";
import { Header, set_header_colors } from "@ui/header";
import { Palette, set_palette_colors } from "@ui/palette";
import { SaveAs, set_save_as_colors } from "@ui/save-as";

import deno from "../deno.json" with { type: "json" };
import { args } from "./args.ts";
import * as cmd from "./commands/mod.ts";

export class App extends Control {
  commands: cmd.Command[] = [
    new cmd.CopyCommand(this),
    new cmd.CutCommand(this),
    new cmd.DebugCommand(this),
    new cmd.ExitCommand(this),
    new cmd.PaletteCommand(this),
    new cmd.PasteCommand(this),
    new cmd.RedoCommand(this),
    new cmd.SaveCommand(this),
    new cmd.SelectAllCommand(this),
    ...vt.TRUECOLOR
      ? [
        new cmd.ThemeBase16Command(this),
        new cmd.ThemeGrayCommand(this),
        new cmd.ThemeNeutralCommand(this),
        new cmd.ThemeSlateCommand(this),
        new cmd.ThemeStoneCommand(this),
        new cmd.ThemeZincCommand(this),
      ]
      : [],
    new cmd.UndoCommand(this),
    new cmd.WhitespaceCommand(this),
    new cmd.WrapCommand(this),
    new cmd.ZenCommand(this),
  ];

  zen_enabled = true;
  file_path = "";
  changes = false;

  ui: {
    header: Header;
    footer: Footer;
    editor: Editor;
    debug: Debug;
    palette: Palette;
    alert: Alert;
    ask: Ask;
    save_as: SaveAs;
  };

  constructor() {
    super();

    const options = this.commands.filter((x) => x.option).map((x) => ({
      ...x.option!,
      shortcuts: x.option!.shortcuts ?? "",
    }));

    options.sort((a, b) => a.description.localeCompare(b.description));

    this.ui = {
      header: new Header(this),
      footer: new Footer(this),
      editor: new Editor(this, { multi_line: true }),
      debug: new Debug(this),
      palette: new Palette(this, options),
      alert: new Alert(this),
      ask: new Ask(this),
      save_as: new SaveAs(this),
    };
  }

  async run(): Promise<void> {
    if (args.version) {
      console.log(`toy ${deno.version} (deno ${Deno.version.deno})`);
      Deno.exit();
    }

    const { editor, debug, header, footer } = this.ui;

    editor.enabled = true;
    editor.on_input_handled = (x) => debug.set_input_time(x);
    editor.on_render = (x) => debug.set_render_time(x);
    editor.on_cursor = (x) => footer.set_cursor_status(x);
    editor.history.on_changed = (x) => {
      this.changes = x > 0;
      header.set_unsaved_flag(x > 0);
    };

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.stop);
    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.set_colors(vt.TRUECOLOR ? theme.NEUTRAL : theme.BASE16);
    this.enable_zen(true);

    if (typeof args._[0] === "string") {
      await this.#open_file(args._[0]);
    }

    await this.#process_input();
  }

  stop = (e?: PromiseRejectionEvent) => {
    vt.restore();

    if (e) {
      console.log(e.reason);
    }

    Deno.exit(0);
  };

  override layout({ y, x, w, h }: Area): void {
    this.y = y;
    this.x = x;
    this.w = w;
    this.h = h;

    const {
      header,
      footer,
      editor,
      debug,
      palette,
      alert,
      ask,
      save_as,
    } = this.ui;

    header.layout(this);
    footer.layout(this);
    editor.layout(
      this.zen_enabled ? this : {
        y: this.y + 1,
        x: this.x,
        w: this.w,
        h: this.h - 2,
      },
    );

    debug.layout(editor);
    palette.layout(editor);

    alert.layout(editor);
    ask.layout(editor);
    save_as.layout(editor);
  }

  render(): void {
    vt.bsu();

    this.ui.header.render();
    this.ui.editor.render();
    this.ui.footer.render();
    this.ui.debug.render();
    this.ui.save_as.render();
    this.ui.alert.render();
    this.ui.ask.render();
    this.ui.palette.render();

    vt.esu();
  }

  set_colors(tokens: theme.Tokens): void {
    set_alert_colors(tokens);
    set_ask_colors(tokens);
    set_editor_colors(tokens);
    set_debug_colors(tokens);
    set_footer_colors(tokens);
    set_header_colors(tokens);
    set_palette_colors(tokens);
    set_save_as_colors(tokens);
  }

  enable_zen(enable: boolean): void {
    const { header, footer, editor } = this.ui;

    this.zen_enabled = enable;

    header.enabled = !enable;
    footer.enabled = !enable;
    editor.index_enabled = !enable;

    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    this.render();
  }

  async save(): Promise<boolean> {
    if (!this.file_path) {
      return await this.#save_as();
    }

    try {
      await this.#save(this.file_path);

      return true;
    } catch (err) {
      await this.ui.alert.open(err);

      return await this.#save_as();
    }
  }

  #on_sigwinch = () => {
    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    vt.dummy_req();
  };

  async #open_file(path: string): Promise<void> {
    const { editor, alert } = this.ui;

    try {
      await this.#load(path);

      editor.reset(true);
      editor.render();

      this.#set_file_path(path);
    } catch (err) {
      if (err instanceof Deno.errors.NotFound) {
        this.#set_file_path(path);
      } else {
        await alert.open(err);

        this.stop();
      }
    }
  }

  #set_file_path(x: string): void {
    this.file_path = x;

    this.ui.header.set_file_path(x);
  }

  async #process_input(): Promise<void> {
    const { editor } = this.ui;

    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.render();
          continue;
        }

        const cmd = this.commands.find((x) =>
          x.match(key as unknown as Record<string, unknown>)
        );
        if (cmd) {
          await cmd.run(key);
          continue;
        }

        if (editor.enabled) {
          if (editor.handle_key(key)) {
            editor.render();
          }
        }
      }
    }
  }

  async #load(path: string): Promise<void> {
    const { buffer } = this.ui.editor;

    using file = await Deno.open(path, { read: true });

    const info = await file.stat();
    if (!info.isFile) {
      throw new Error(`${path} is not a file`);
    }

    const bytes = new Uint8Array(1024 ** 2 * 64);
    const decoder = new TextDecoder();

    while (true) {
      const n = await file.read(bytes);
      if (typeof n !== "number") {
        break;
      }

      if (n > 0) {
        const text = decoder.decode(bytes.subarray(0, n), { stream: true });
        buffer.append(text);
      }
    }

    const text = decoder.decode();
    if (text.length > 0) {
      buffer.append(text);
    }
  }

  async #save(path: string): Promise<void> {
    const { buffer } = this.ui.editor;

    using file = await Deno.open(path, {
      create: true,
      write: true,
      truncate: true,
    });

    const encoder = new TextEncoderStream();
    const writer = encoder.writable.getWriter();

    encoder.readable.pipeTo(file.writable);

    for (const text of buffer.read(0)) {
      await writer.write(text);
    }
  }

  async #save_as(): Promise<boolean> {
    while (true) {
      const path = await this.ui.save_as.open(this.file_path);
      if (!path) {
        return false;
      }

      try {
        await this.#save(path);

        this.#set_file_path(path);

        return true;
      } catch (err) {
        await this.ui.alert.open(err);
      }
    }
  }
}
