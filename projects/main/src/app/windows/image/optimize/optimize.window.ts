import { Window } from '../../window';

export class ImageOptimizeWindow extends Window {
  constructor() {
    super('image/optimize', { resizable: false, width: 500, height: 250, title: 'Image Optimizer', alwaysOnTop: true });
  }
}
