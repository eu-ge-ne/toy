export const enum CharColor {
  Undefined,
  Visible,
  Whitespace,
  Empty,
  VisibleSelected,
  WhitespaceSelected,
  EmptySelected,
}

export function charColor(
  isSelected: boolean,
  isVisible: boolean,
  whitespaceEnabled: boolean,
): CharColor {
  if (isSelected) {
    if (isVisible) {
      return CharColor.VisibleSelected;
    } else if (whitespaceEnabled) {
      return CharColor.WhitespaceSelected;
    } else {
      return CharColor.EmptySelected;
    }
  } else {
    if (isVisible) {
      return CharColor.Visible;
    } else if (whitespaceEnabled) {
      return CharColor.Whitespace;
    } else {
      return CharColor.Empty;
    }
  }
}
