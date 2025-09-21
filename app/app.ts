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

  header: Header;
  footer: Footer;
  editor: Editor;
  debug: Debug;
  palette: Palette;
  alert: Alert;
  ask: Ask;
  saveas: SaveAs;

  zen_enabled = true;
  file_path = "";
  changes = false;

  constructor() {
    super();

    const options = this.commands.filter((x) => x.option).map((x) => ({
      ...x.option!,
      shortcuts: x.option!.shortcuts ?? "",
    }));
    options.sort((a, b) => a.description.localeCompare(b.description));

    this.header = new Header(this);
    this.footer = new Footer(this);
    this.editor = new Editor(this, { multi_line: true });
    this.debug = new Debug(this);
    this.palette = new Palette(this, options);
    this.alert = new Alert(this);
    this.ask = new Ask(this);
    this.saveas = new SaveAs(this);
  }

  async run(): Promise<void> {
    if (args.version) {
      console.log(`toy ${deno.version} (deno ${Deno.version.deno})`);
      Deno.exit();
    }

    this.editor.enabled = true;
    this.editor.on_input_handled = (x) => this.debug.set_input_time(x);
    this.editor.on_render = (x) => this.debug.set_render_time(x);
    this.editor.on_cursor = (x) => this.footer.set_cursor_status(x);
    this.editor.history.on_changed = (x) => {
      this.changes = x > 0;
      this.header.set_unsaved_flag(x > 0);
    };

    vt.init();
    globalThis.addEventListener("unhandledrejection", this.exit);
    Deno.addSignalListener("SIGWINCH", this.#on_sigwinch);

    this.set_colors(vt.TRUECOLOR ? theme.NEUTRAL : theme.BASE16);
    this.enable_zen(true);

    if (typeof args._[0] === "string") {
      this.#set_file_path(args._[0]);
      await this.#try_open_file();
    }

    await this.#process_input();
  }

  exit = (e?: PromiseRejectionEvent) => {
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

    this.header.layout(this);
    this.footer.layout(this);
    this.editor.layout(
      this.zen_enabled ? this : {
        y: this.y + 1,
        x: this.x,
        w: this.w,
        h: this.h - 2,
      },
    );
    this.debug.layout(this.editor);
    this.palette.layout(this.editor);
    this.alert.layout(this.editor);
    this.ask.layout(this.editor);
    this.saveas.layout(this.editor);
  }

  render(): void {
    vt.bsu();

    this.header.render();
    this.editor.render();
    this.footer.render();
    this.debug.render();
    this.saveas.render();
    this.alert.render();
    this.ask.render();
    this.palette.render();

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
    this.zen_enabled = enable;

    this.header.enabled = !enable;
    this.footer.enabled = !enable;
    this.editor.index_enabled = !enable;

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
      await this.alert.open(err);

      return await this.#save_as();
    }
  }

  #on_sigwinch = () => {
    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    vt.dummy_req();
  };

  #set_file_path(x: string): void {
    this.file_path = x;

    this.header.set_file_path(x);
  }

  async #try_open_file(): Promise<void> {
    try {
      await this.#load();

      this.editor.reset(true);
      this.editor.render();
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.alert.open(err);

        this.exit();
      }
    }
  }

  async #load(): Promise<void> {
    using file = await Deno.open(this.file_path, { read: true });

    const info = await file.stat();
    if (!info.isFile) {
      throw new Error(`${this.file_path} is not a file`);
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
        this.editor.buffer.append(text);
      }
    }

    const text = decoder.decode();
    if (text.length > 0) {
      this.editor.buffer.append(text);
    }
  }

  async #process_input(): Promise<void> {
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
          await cmd.run();
          continue;
        }

        if (this.editor.enabled) {
          if (this.editor.handle_key(key)) {
            this.editor.render();
          }
        }
      }
    }
  }

  async #save(path: string): Promise<void> {
    using file = await Deno.open(path, {
      create: true,
      write: true,
      truncate: true,
    });

    const encoder = new TextEncoderStream();
    const writer = encoder.writable.getWriter();

    encoder.readable.pipeTo(file.writable);

    for (const text of this.editor.buffer.read(0)) {
      await writer.write(text);
    }
  }

  async #save_as(): Promise<boolean> {
    while (true) {
      const path = await this.saveas.open(this.file_path);
      if (!path) {
        return false;
      }

      try {
        await this.#save(path);

        this.#set_file_path(path);

        return true;
      } catch (err) {
        await this.alert.open(err);
      }
    }
  }
}
