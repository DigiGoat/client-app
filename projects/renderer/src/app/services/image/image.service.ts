import { Injectable } from '@angular/core';
import type { ImageMap, OptimizeProgress } from '../../../../../shared/services/image/image.service';

@Injectable({
  providedIn: 'root'
})
export class ImageService {

  constructor() { }
  set onchange(callback: (images: ImageMap) => void) {
    window.electron.image.onchange(callback);
  }
  getImageMap = window.electron.image.getImageMap;
  setImageMap = window.electron.image.setImageMap;
  uploadImages = window.electron.image.uploadImages;
  addImages = window.electron.image.addImages;
  mvImage = window.electron.image.mvImage;
  deleteImages = window.electron.image.deleteImages;
  getUploadDir = window.electron.image.getUploadDir;
  optimizeImages = window.electron.image.optimizeImages;
  set onOptimizeProgress(callback: (progress: OptimizeProgress) => void) {
    window.electron.image.onOptimizeProgress(callback);
  }
  set onOptimizeFail(callback: (file: string) => void) {
    window.electron.image.onOptimizeFail(callback);
  }
}
