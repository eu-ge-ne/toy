import * as file from "@lib/file";
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
import * as cmd from "./commands/mod.ts";
import { args } from "./args.ts";

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
  changes = false;
  #file_path = "";

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
      await this.open(args._[0]);
    }

    this.editor.reset(true);
    this.editor.render();

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

  #on_sigwinch = () => {
    const { columns: w, rows: h } = Deno.consoleSize();
    this.layout({ y: 0, x: 0, w, h });

    vt.dummy_req();
  };

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

  async open(file_path: string): Promise<void> {
    try {
      await file.load(file_path, this.editor.buffer);

      this.#set_file_path(file_path);
    } catch (err) {
      const not_found = err instanceof Deno.errors.NotFound;

      if (!not_found) {
        await this.alert.open(err);

        this.exit();
      }
    }
  }

  async save(): Promise<boolean> {
    if (this.#file_path) {
      return await this.#save_file();
    } else {
      return await this.#save_file_as();
    }
  }

  async #save_file(): Promise<boolean> {
    try {
      await file.save(this.#file_path, this.editor.buffer);

      return true;
    } catch (err) {
      await this.alert.open(err);

      return await this.#save_file_as();
    }
  }

  async #save_file_as(): Promise<boolean> {
    while (true) {
      const file_path = await this.saveas.open(this.#file_path);
      if (!file_path) {
        return false;
      }

      try {
        await file.save(file_path, this.editor.buffer);

        this.#set_file_path(file_path);

        return true;
      } catch (err) {
        await this.alert.open(err);
      }
    }
  }

  #set_file_path(file_path: string): void {
    this.#file_path = file_path;

    this.header.set_file_path(file_path);
  }
}
