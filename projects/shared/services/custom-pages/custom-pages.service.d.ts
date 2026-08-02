
export interface CustomPagesService {
  getCustomPages: () => Promise<Record<string, string>[]>;
  setCustomPages: (pages: Record<string, string>[]) => Promise<void>;
  onCustomPagesChange: (callback: (customPages: Record<string, string>[]) => void) => void;
}

export type CustomPage = Partial<{
  title?: string;
  content?: string;
}>;

export interface CustomPageSummary {
  title: string;
  url: string;
}
