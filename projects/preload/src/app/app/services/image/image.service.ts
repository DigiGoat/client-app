import { ipcRenderer, webUtils } from 'electron';
import { ImageService as ImageServiceType } from '../../../../../../shared/services/image/image.service';

export const ImageService: ImageServiceType = {
  onchange: (callback) => ipcRenderer.on('image:change', (_event, images) => callback(images)),
  getImageMap: () => ipcRenderer.invoke('image:getImageMap'),
  setImageMap: (imageMap) => ipcRenderer.invoke('image:setImageMap', imageMap),
  uploadImages: (...images) => ipcRenderer.invoke('image:uploadImages', ...images),
  mvImage: (oldDir, newDir, image) => ipcRenderer.invoke('image:mvImage', oldDir, newDir, image),
  deleteImages: (directory, images) => ipcRenderer.invoke('image:deleteImages', directory, images),
  addImages: (directory, ...images) => ipcRenderer.invoke('image:addImages', directory, ...images.map(image => image instanceof File ? webUtils.getPathForFile(image) : image)),
  getUploadDir: () => ipcRenderer.invoke('image:getUploadDir'),
  optimizeImages: (imageMap) => ipcRenderer.invoke('image:optimizeImages', imageMap),
  onOptimizeProgress: (callback) => ipcRenderer.on('image:optimizeProgress', (_event, progress) => callback(progress)),
  onOptimizeFail: (callback) => ipcRenderer.on('image:optimizeFail', (_event, file) => callback(file))
};
