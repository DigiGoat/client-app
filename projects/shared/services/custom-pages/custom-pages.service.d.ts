
export interface CustomPagesService {
  getCustomPages: () => Promise<CustomPage[]>;
  setCustomPages: (pages: CustomPage[]) => Promise<void>;
  onCustomPagesChange: (callback: (customPages: CustomPage[]) => void) => void;
}

export type CustomPage = Partial<{
  title?: string;
  content?: string;
}>;

export interface CustomPageSummary {
  title: string;
  url: string;
}
