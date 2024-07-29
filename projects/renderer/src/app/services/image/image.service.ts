import { Injectable } from '@angular/core';
import type { ImageMap } from '../../../../../shared/services/image/image.service';

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
}
