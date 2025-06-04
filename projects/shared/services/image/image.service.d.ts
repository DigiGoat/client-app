export interface ImageService {
  getImages: (searchQueries: string[]) => Promise<Image[]>;
  readLocalImage: (path: string) => Promise<string>;
  onchange: (callback: (images: ImageMap) => void) => void;
  writeImage: (path: string, base64: string) => Promise<void>;
  deleteImage: (path: string) => Promise<void>;
  getImageMap: () => Promise<ImageMap>;
  setImageMap: (imageMap: ImageMap) => Promise<void>;
  readImage: (path: string) => Promise<string>;
  stringToBase64: (string: string | ArrayBuffer) => string;
  getExtension: (path: string) => Promise<string>;
  uploadImages: (...images: string[]) => Promise<string[]>;
  getUploadDir: () => Promise<string>;
  getImportPath: (file: File) => string;
  optimizeImages: (imageMap: ImageMap) => Promise<ImageMap>;
  onOptimizeProgress: (callback: (progress: OptimizeProgress) => void) => void;
  onOptimizeFail: (callback: (file: string) => void) => void;
}
export type Image = { file: string, alt?: string; };
export type ImageMap = { [directory: string]: Image[]; };
export type OptimizeProgress = {
  directory: string, directoryIndex: number, totalDirectories: number, file: string, fileIndex: number, totalFiles: number;
};
