import { Window } from '../../window';

export class ImageOptimizeWindow extends Window {
  constructor() {
    super({ resizable: false, width: 500, height: 250, title: 'Image Optimizer', alwaysOnTop: true }, 'image/optimize');
  }
}
