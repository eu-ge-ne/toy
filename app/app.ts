import * as theme from "@lib/theme";
import { Area, Control } from "@lib/ui";
import * as vt from "@lib/vt";
import { Alert, set_alert_colors } from "@ui/alert";
import { Ask, set_ask_colors } from "@ui/ask";
import { Debug, set_debug_colors } from "@ui/debug";
import { Editor, set_editor_colors } from "@ui/editor";
import { Footer, set_footer_colors } from "@ui/footer";
import { Header, set_header_colors } from "@ui/header";
import { Palette, PaletteOption, set_palette_colors } from "@ui/palette";
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

  options: PaletteOption[];

  zen_enabled = true;
  file_path = "";
  changes = false;

  ui = {
    header: new Header(this),
    footer: new Footer(this),
    editor: new Editor(this, { multi_line: true }),
    debug: new Debug(this),
    palette: new Palette(this),
    alert: new Alert(this),
    ask: new Ask(this),
    save_as: new SaveAs(this),
  };

  constructor() {
    super();

    this.options = this.commands.filter((x) => x.option).map((x) => ({
      ...x.option!,
      shortcuts: x.option!.shortcuts ?? "",
    }));

    this.options.sort((a, b) => a.description.localeCompare(b.description));
  }

  async run(): Promise<void> {
    if (args.version) {
      console.log(`toy ${deno.version}`);
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

    await this.#load();

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
      await this.#save_buffer(this.file_path);

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

  async #load(): Promise<void> {
    const path = args._[0];
    if (typeof path !== "string") {
      return;
    }

    const { editor, alert } = this.ui;

    try {
      using file = await Deno.open(path, { read: true });

      const info = await file.stat();
      if (!info.isFile) {
        throw new Error(`${path} is not a file`);
      }

      await editor.buffer.load(file);

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
    while (true) {
      for await (const key of vt.read()) {
        if (key instanceof Uint8Array) {
          this.render();
          continue;
        }

        if (typeof key !== "string") {
          const command = this.commands.find((x) => x.match(key));
          if (command && !cmd.Command.running) {
            await command.run(key);
            continue;
          }
        }

        if (this.ui.editor.enabled) {
          if (this.ui.editor.handle_input(key)) {
            this.ui.editor.render();
          }
        }
      }
    }
  }

  async #save_buffer(path: string): Promise<void> {
    using file = await Deno.open(path, {
      create: true,
      write: true,
      truncate: true,
    });

    const stream = new TextEncoderStream();
    stream.readable.pipeTo(file.writable);
    const writer = stream.writable.getWriter();

    for (const text of this.ui.editor.buffer.read()) {
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
        await this.#save_buffer(path);

        this.#set_file_path(path);

        return true;
      } catch (err) {
        await this.ui.alert.open(err);
      }
    }
  }
}
