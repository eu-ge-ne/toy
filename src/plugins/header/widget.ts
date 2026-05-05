import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { TextWidget } from "@widgets/text";

interface Props {
  fileName: string;
  modified: boolean;
}

export class HeaderWidget extends widgets.Widget<Props> {
  protected override children: {
    bg: BgWidget;
    text: TextWidget;
  };

  constructor(props: Props) {
    super(props);

    this.children = {
      bg: new BgWidget(),
      text: new TextWidget({ align: "center" }),
    };
  }

  override resizeChildren(): void {
    const { bg, text } = this.children;

    bg.resize(this.width, this.height, this.y, this.x);
    text.resize(this.width, this.height, this.y, this.x);
  }

  render(): void {
    vt.buf.write(vt.cursor.save);

    this.children.bg.render();

    const f = this.props.modified ? " +" : "";
    this.children.text.value = `${this.props.fileName}${f}`;
    this.children.text.render();

    vt.buf.write(vt.cursor.restore);
  }

  setTheme(theme: themes.Theme): void {
    const bg = new Uint8Array(theme.bgDark0);
    const text = new Uint8Array([...theme.bgDark0, ...theme.fgDark0]);

    this.children.bg.color = bg;
    this.children.text.color = text;
  }
}
