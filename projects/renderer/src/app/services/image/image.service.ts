import { Injectable } from '@angular/core';
import type { ImageMap, OptimizeProgress } from '../../../../../shared/services/image/image.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }
  getImages = window.electron.image.getImages;
  set onchange(callback: (images: ImageMap) => void) {
    window.electron.image.onchange(callback);
  }
  readLocalImage = window.electron.image.readLocalImage;
  writeImage = window.electron.image.writeImage;
  deleteImage = window.electron.image.deleteImage;
  getImageMap = window.electron.image.getImageMap;
  setImageMap = window.electron.image.setImageMap;
  readImage = window.electron.image.readImage;
  stringToBase64 = window.electron.image.stringToBase64;
  getExtension = window.electron.image.getExtension;
  uploadImages = window.electron.image.uploadImages;
  getUploadDir = window.electron.image.getUploadDir;
  getImportPath = window.electron.image.getImportPath;
  optimizeImages = window.electron.image.optimizeImages;
  set onOptimizeProgress(callback: (progress: OptimizeProgress) => void) {
    window.electron.image.onOptimizeProgress(callback);
  }
  set onOptimizeFail(callback: (file: string) => void) {
    window.electron.image.onOptimizeFail(callback);
  }
}
