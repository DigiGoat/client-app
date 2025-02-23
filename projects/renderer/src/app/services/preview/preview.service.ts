import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PreviewService {

  constructor() { }

  getPreviewActive = window.electron.preview.getPreviewActive;
  getPreviewVisible = window.electron.preview.getPreviewVisible;
  startPreview = window.electron.preview.startPreview;
  stopPreview = window.electron.preview.stopPreview;

  set onchange(callback: () => void) {
    window.electron.preview.onchange(callback);
  }

  set onprogress(callback: (progress: number) => void) {
    window.electron.preview.onprogress(callback);
  }
}
