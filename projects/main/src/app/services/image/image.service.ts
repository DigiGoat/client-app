import { app, BrowserWindow } from 'electron';
import { ensureFile, ensureFileSync, exists, readFile, readJson, rm, watch, writeFile, writeJSON } from 'fs-extra';
import { join } from 'path';
import { ImageService as ImageServiceType, type ImageMap } from '../../../../../shared/services/image/image.service';
import type { BackendService } from '../../../../../shared/shared.module';

export class ImageService {
  base = join(app.getPath('userData'), 'repo');
  imageMap = join(this.base, 'src/assets/images/map.json');
  async getImageMap(): Promise<ImageMap> {
    try {
      this.watchImages();
      return await readJson(this.imageMap);
    } catch (err) {
      console.warn('Error Reading Image Map:', err);
      return {};
    }
  }
  async getImages(searchQueries: string[]) {
    try {
      const map = await this.getImageMap();
      const keys = Object.keys(map).filter(directory => searchQueries.includes(directory));
      console.log('keys:', keys);
      const images = [];
      for (const key of keys) {
        if (map[key].length) {
          images.push(...map[key].map(image => { return { ...image, file: `./${key}/${image.file}` }; }));
        }
      }
      return images;
    } catch (err) {
      console.warn('Error Reading Image Map:', err);
      return [];
    }
  }
  api: BackendService<ImageServiceType> = {
    getImages: async (_event, searchQueries) => {
      return await this.getImages(searchQueries);
    },
    readLocalImage: async (_event, path) => {
      return `${await readFile(join(this.base, 'src/assets/images', path), 'base64')}`;
    },
    writeImage: async (_event, path, base64) => {
      await ensureFile(join(this.base, 'src/assets/images', path));
      await writeFile(join(this.base, 'src/assets/images', path), base64, 'base64');
    },
    deleteImage: async (_event, path) => {
      await ensureFile(join(this.base, 'src/assets/images', path));
      await rm(join(this.base, 'src/assets/images', path));
    },
    getImageMap: async () => {
      return await this.getImageMap();
    },
    setImageMap: async (_event, imageMap) => {
      await ensureFile(this.imageMap);
      await writeJSON(this.imageMap, imageMap);
    },
    readImage: async (_event, path) => {
      return await readFile(path, 'base64');
    }
  };
  watchingImages = false;
  watchImages() {
    if (this.watchingImages) return;
    this.watchingImages = true;
    ensureFileSync(this.imageMap);
    watch(this.imageMap, async (event) => {
      try {
        const windows = BrowserWindow.getAllWindows();
        const newImageMap = await this.getImageMap();
        windows.forEach(window => {
          if (!window.isDestroyed()) {
            window.webContents.send('image:change', newImageMap);
          }
        });
      } catch (err) {
        console.warn('Error Updating Image Map:', err);
      }
      if (event === 'rename') {
        this.watchingImages = false;
        if (await exists(join(this.base, '.git'))) {
          this.watchImages();
        }
      }
    });
  }
  constructor() {
    //this.watchImages();
  }
}
