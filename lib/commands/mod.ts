import { Command } from "./command.ts";
import { CopyCommand } from "./copy.ts";
import { CutCommand } from "./cut.ts";
import { DebugCommand } from "./debug.ts";
import { ExitCommand } from "./exit.ts";
import { PaletteCommand } from "./palette.ts";
import { PasteCommand } from "./paste.ts";
import { RedoCommand } from "./redo.ts";
import { SaveCommand } from "./save.ts";
import { SelectAllCommand } from "./select-all.ts";
import { ThemeBase16Command } from "./theme-base16.ts";
import { ThemeGrayCommand } from "./theme-gray.ts";
import { ThemeNeutralCommand } from "./theme-neutral.ts";
import { ThemeSlateCommand } from "./theme-slate.ts";
import { ThemeStoneCommand } from "./theme-stone.ts";
import { ThemeZincCommand } from "./theme-zinc.ts";
import { UndoCommand } from "./undo.ts";
import { WhitespaceCommand } from "./whitespace.ts";
import { WrapCommand } from "./wrap.ts";
import { ZenCommand } from "./zen.ts";

export const commands: Command[] = [
  CopyCommand,
  CutCommand,
  DebugCommand,
  ExitCommand,
  PaletteCommand,
  PasteCommand,
  RedoCommand,
  SaveCommand,
  SelectAllCommand,
  ThemeBase16Command,
  ThemeGrayCommand,
  ThemeNeutralCommand,
  ThemeSlateCommand,
  ThemeStoneCommand,
  ThemeZincCommand,
  UndoCommand,
  WhitespaceCommand,
  WrapCommand,
  ZenCommand,
];
