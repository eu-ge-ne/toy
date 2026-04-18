import * as themes from "@lib/themes";
import * as vt from "@lib/vt";
import * as widgets from "@lib/widgets";
import { Bg } from "@widgets/bg";
import { Text } from "@widgets/text";

const MIB = Math.pow(1024, 2);

interface DebugProps {
  disabled: boolean;
  renderTime: number;
  inputTime: number;
}

export class Debug extends widgets.Frame {
  protected override children: {
    bg: Bg;
    line1: Text;
    line2: Text;
    line3: Text;
    line4: Text;
    line5: Text;
  };

  constructor(readonly props: DebugProps) {
    super();

    this.children = {
      bg: new Bg(),
      line1: new Text({ align: "left" }),
      line2: new Text({ align: "left" }),
      line3: new Text({ align: "left" }),
      line4: new Text({ align: "left" }),
      line5: new Text({ align: "left" }),
    };
  }

  override resizeChildren(): void {
    const { bg, line1, line2, line3, line4, line5 } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    line1.resize(this.width - 2, 1, this.y + 1, this.x + 1);
    line2.resize(this.width - 2, 1, this.y + 2, this.x + 1);
    line3.resize(this.width - 2, 1, this.y + 3, this.x + 1);
    line4.resize(this.width - 2, 1, this.y + 4, this.x + 1);
    line5.resize(this.width - 2, 1, this.y + 5, this.x + 1);
  }

  render(): void {
    if (this.props.disabled) {
      return;
    }

    vt.buf.write(vt.cursor.save);

    const mem = Deno.memoryUsage();
    const rss = (mem.rss / MIB).toFixed();
    const heap_total = (mem.heapTotal / MIB).toFixed();
    const heap_used = (mem.heapUsed / MIB).toFixed();
    const external_mem = (mem.external / MIB).toFixed();

    this.children.bg.render();

    const i = this.props.inputTime.toFixed(1);
    this.children.line1.value = `Input    : ${i} ms`;
    this.children.line1.render();

    const r = this.props.renderTime.toFixed(1);
    this.children.line2.value = `Render   : ${r} ms`;
    this.children.line2.render();

    this.children.line3.value = `RSS      : ${rss} MiB`;
    this.children.line3.render();

    this.children.line4.value = `Heap     : ${heap_used}/${heap_total} MiB`;
    this.children.line4.render();

    this.children.line5.value = `External : ${external_mem} MiB`;
    this.children.line5.render();

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
