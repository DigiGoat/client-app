import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class DialogService {

  showOpenDialog = window.electron.dialog.showOpenDialog;
  showSaveDialog = window.electron.dialog.showSaveDialog;
  showMessageBox = window.electron.dialog.showMessageBox;
  FILTERS = {
    IMAGES: {
      name: 'Images',
      extensions: ['apng', 'png', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'svg', 'webp', 'bmp', 'iso', 'cur', 'tif', 'tiff']
    },
    ALL: {
      name: 'All Files',
      extensions: ['*']
    }
  };
}
