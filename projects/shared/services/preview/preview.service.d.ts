export interface PreviewService {
  getPreviewActive: () => Promise<boolean>;
  getPreviewVisible: () => Promise<boolean>;
  startPreview: () => Promise<void>;
  stopPreview: () => Promise<void>;
  onchange: (callback: () => void) => void;
  onprogress: (callback: (progress: number) => void) => void;
}
