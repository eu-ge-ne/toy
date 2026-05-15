import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { TextWidget } from "@widgets/text";

export class DebugWidget extends widgets.Widget {
  visible = false;
  version = "";
  renderElapsed = 0;
  inputElapsed = 0;
  rss = "";
  heapTotal = "";
  heapUsed = "";
  externalMem = "";

  protected override children: {
    bg: BgWidget;
    line1: TextWidget;
    line2: TextWidget;
    line3: TextWidget;
    line4: TextWidget;
    line5: TextWidget;
    line6: TextWidget;
  };

  constructor() {
    super();

    this.children = {
      bg: new BgWidget(),
      line1: new TextWidget({ align: "left" }),
      line2: new TextWidget({ align: "left" }),
      line3: new TextWidget({ align: "left" }),
      line4: new TextWidget({ align: "left" }),
      line5: new TextWidget({ align: "left" }),
      line6: new TextWidget({ align: "left" }),
    };
  }

  override resizeChildren(): void {
    const { bg, line1, line2, line3, line4, line5, line6 } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);

    line1.resize(this.width - 2, 1, this.y + 1, this.x + 1);
    line2.resize(this.width - 2, 1, this.y + 3, this.x + 1);
    line3.resize(this.width - 2, 1, this.y + 4, this.x + 1);
    line4.resize(this.width - 2, 1, this.y + 6, this.x + 1);
    line5.resize(this.width - 2, 1, this.y + 7, this.x + 1);
    line6.resize(this.width - 2, 1, this.y + 8, this.x + 1);
  }

  render(): void {
    if (!this.visible) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    this.children.line1.value = this.version;
    this.children.line1.render();

    const i = this.inputElapsed.toFixed(1);
    this.children.line2.value = `Input    : ${i} ms`;
    this.children.line2.render();

    const r = this.renderElapsed.toFixed(1);
    this.children.line3.value = `Render   : ${r} ms`;
    this.children.line3.render();

    this.children.line4.value = `RSS      : ${this.rss} MiB`;
    this.children.line4.render();

    this.children.line5.value = `Heap     : ${this.heapUsed}/${this.heapTotal} MiB`;
    this.children.line5.render();

    this.children.line6.value = `External : ${this.externalMem} MiB`;
    this.children.line6.render();

    vt.buf.write(vt.cursor.restore);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgLight0);
    const text = new Uint8Array([...theme.bgLight0, ...theme.fgDark0]);

    this.children.bg.color = bg;
    this.children.line1.color = text;
    this.children.line2.color = text;
    this.children.line3.color = text;
    this.children.line4.color = text;
  }
}
