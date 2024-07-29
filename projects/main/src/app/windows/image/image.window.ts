import { Window } from '../window';

export class ImageWindow extends Window {
  constructor(searchQueries: string[]) {
    super({ minWidth: 576, height: 500, title: 'Images', fullscreen: false }, `image?${searchQueries.join('&')}`);
  }
}
