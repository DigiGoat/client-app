export interface ImageService {
  getImages: (searchQueries: string[]) => Promise<Image[]>;
  readLocalImage: (path: string) => Promise<string>;
  onchange: (callback: (images: ImageMap) => void) => void;
  writeImage: (path: string, base64: string) => Promise<void>;
  deleteImage: (path: string) => Promise<void>;
  getImageMap: () => Promise<ImageMap>;
  setImageMap: (imageMap: ImageMap) => Promise<void>;
  readImage: (path: string) => Promise<string>;
}
export type Image = { file: string, alt?: string; };
export type ImageMap = { [directory: string]: Image[]; };
