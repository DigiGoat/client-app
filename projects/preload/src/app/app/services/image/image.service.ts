import { ipcRenderer } from 'electron';
import { extname } from 'path';
import { ImageService as ImageServiceType } from '../../../../../../shared/services/image/image.service';

export const ImageService: ImageServiceType = {
  getImages: (searchQueries) => ipcRenderer.invoke('image:getImages', searchQueries),
  onchange: (callback) => ipcRenderer.on('image:change', (_event, images) => callback(images)),
  readLocalImage: (path) => ipcRenderer.invoke('image:readLocalImage', path),
  writeImage: (path, base64) => ipcRenderer.invoke('image:writeImage', path, base64),
  deleteImage: (path) => ipcRenderer.invoke('image:deleteImage', path),
  getImageMap: () => ipcRenderer.invoke('image:getImageMap'),
  setImageMap: (imageMap) => ipcRenderer.invoke('image:setImageMap', imageMap),
  readImage: (path) => ipcRenderer.invoke('image:readImage', path),
  stringToBase64: (string) => Buffer.from(string as string).toString('base64'),
  getExtension: (path) => extname(path)
};
