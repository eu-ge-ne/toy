export interface PluginProps {
  onRefresh?: () => void;
  onExit?: () => void;
}

export abstract class Plugin {
  constructor(protected readonly props: PluginProps) {
  }

  abstract start(): void;
  abstract stop(): void;
}
