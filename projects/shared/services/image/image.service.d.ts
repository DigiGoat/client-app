export interface ImageService {
  onchange: (callback: (images: ImageMap) => void) => void;
  getImageMap: () => Promise<ImageMap>;
  setImageMap: (imageMap: ImageMap) => Promise<void>;
  uploadImages: (...images: string[]) => Promise<string[]>;
  addImages: (directory: string, ...images: (ArrayBuffer | string | File)[]) => Promise<string[]>;
  mvImage: (oldDir: string, newDir: string, image: string) => Promise<void>;
  deleteImages: (directory: string, image: string[]) => Promise<void>;
  getUploadDir: () => Promise<string>;
  optimizeImages: (imageMap: ImageMap) => Promise<ImageMap>;
  onOptimizeProgress: (callback: (progress: OptimizeProgress) => void) => void;
  onOptimizeFail: (callback: (file: string) => void) => void;
}
export type Image = { file: string, alt?: string; };
export type ImageMap = { [directory: string]: Image[]; };
export type OptimizeProgress = {
  directory: string, directoryIndex: number, totalDirectories: number, file: string, fileIndex: number, totalFiles: number;
};
