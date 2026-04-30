import * as themes from "@libs/themes";
import * as vt from "@libs/vt";
import * as widgets from "@libs/widgets";
import { BgWidget } from "@widgets/bg";
import { TextWidget } from "@widgets/text";

interface Props {
  ln: number;
  col: number;
  lineCount: number;
}

export class FooterWidget extends widgets.Frame<Props> {
  protected override children: {
    bg: BgWidget;
    text: TextWidget;
  };

  constructor(props: Props) {
    super(props);

    this.children = {
      bg: new BgWidget(),
      text: new TextWidget({ align: "right" }),
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

    const ln = this.props.ln + 1;
    const col = this.props.col + 1;
    const pct = this.props.lineCount === 0
      ? 0
      : ((this.props.ln / this.props.lineCount) * 100).toFixed(0);

    this.children.text.value = `${ln} ${col}  ${pct}% `;

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
