import { app, BrowserWindow, protocol } from 'electron';
import { dialog, net } from 'electron/main';
import { copyFile, ensureDir, ensureFile, ensureFileSync, exists, readFile, readJson, rm, watch, writeFile, writeJSON } from 'fs-extra';
import { extname, join } from 'path';
import sharp from 'sharp';
import { ImageService as ImageServiceType, type ImageMap, type OptimizeProgress } from '../../../../../shared/services/image/image.service';
import type { BackendService } from '../../../../../shared/shared.module';
import { ImageOptimizeWindow } from '../../windows/image/optimize/optimize.window';

export class ImageService {
  base = join(app.getPath('userData'), 'repo');
  imageMap = join(this.base, 'src/assets/images/map.json');
  uploadDir = join(this.base, 'src/assets/images/uploads');
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
    },
    getExtension: async (_event, path) => {
      return extname(path);
    },
    uploadImages: async (_event, ...images) => {
      await ensureDir(this.uploadDir);
      let i = 0;
      const timestamp = Date.now();
      const paths = [];
      for (const image of images) {
        const name = `${timestamp}-${i}${extname(image)}`;
        await copyFile(image, join(this.uploadDir, name));
        paths.push('uploads/' + name);
        i++;
      }
      return paths;
    },
    getUploadDir: async () => {
      await ensureDir(this.uploadDir);
      return this.uploadDir;
    },
    optimizeImages: async (_event, imageMap) => {
      const assetsDir = join(this.base, 'src/assets/images');
      const newImageMap: ImageMap = {};

      for (const [directory, files] of Object.entries(imageMap)) {
        this.notifyOptimizeProgress({
          directory,
          directoryIndex: Object.keys(imageMap).indexOf(directory),
          totalDirectories: Object.keys(imageMap).length,
          file: '',
          fileIndex: 0,
          totalFiles: files.length
        });
        newImageMap[directory] = [];
        for (const fileObj of files) {
          this.notifyOptimizeProgress({
            file: fileObj.file,
            fileIndex: files.indexOf(fileObj),
          });
          const originalFile = fileObj.file;
          const originalPath = join(assetsDir, directory, originalFile);

          // Skip if file doesn't exist
          if (!(await exists(originalPath))) continue;

          // Build optimized filename
          const baseName = originalFile.replace(/\.[^/.]+$/, ''); // remove extension
          const optimizedFile = `${baseName}+.webp`;
          const optimizedPath = join(assetsDir, directory, optimizedFile);

          // Skip if already optimized
          if (originalFile.endsWith('+.webp')) {
            newImageMap[directory].push(fileObj);
            continue;
          }

          // Optimize with sharp
          try {
            await sharp(originalPath)
              .resize({ height: 400 })
              .webp()
              .withMetadata()
              .toFile(optimizedPath);

            // Delete the original image after optimizing
            await rm(originalPath);

            newImageMap[directory].push({ ...fileObj, file: optimizedFile });
          } catch (err) {
            console.warn(`Failed to optimize ${originalPath}:`, err);
            newImageMap[directory].push(fileObj); // Keep original if optimization fails
            this.notifyOptimizeFail(`${directory}/${originalFile}`);
          }
        }
      }
      return newImageMap;
    }
  };
  watchingImages = false;
  watchImages() {
    if (this.watchingImages) return;
    ensureFileSync(this.imageMap);
    this.watchingImages = true;
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
    }).on('error', async () => {
      this.watchingImages = false;
      if (await exists(join(this.base, '.git'))) {
        this.watchImages();
      }
    });

  }
  constructor() {
    this.watchImages();
    app.once('ready', () => {
      protocol.handle('image', req => {
        const path = req.url.replace('image:', '');
        const image = join(this.base, 'src', path);
        console.log('image:', image);
        return net.fetch(`file://${image}`);
      });
    });
    this.checkForOptimizations();
  }
  async checkForOptimizations() {
    console.log('Checking for image optimizations...');
    console.debug('Checking image map at:', this.imageMap);
    if (await exists(this.imageMap)) {
      const imageMap = await readJson(this.imageMap) as ImageMap;

      // Check for any optimized images
      let hasOptimized = false;
      console.debug('Checking for optimized images in the image map');
      for (const files of Object.values(imageMap)) {
        if (files.some(fileObj => fileObj.file.endsWith('+.webp'))) {
          hasOptimized = true;
          break;
        }
      }
      console.debug('Has optimized images:', hasOptimized);
      // If none are optimized, prompt the user
      if (!hasOptimized) {
        if (app.isReady()) {
          this.askForOptimizations();
        } else {
          app.once('ready', () => this.askForOptimizations());
        }
      }
    }
  }
  async askForOptimizations() {
    const result = await dialog.showMessageBox({
      type: 'question',
      buttons: ['Optimize', 'Later'],
      defaultId: 0,
      cancelId: 1,
      message: 'Optimize Images',
      detail: 'Optimizing images will reduce their file size and improve loading times. Would you like to optimize your images now? (You can always do this later in the settings.)',
    });
    if (result.response === 0) {
      new ImageOptimizeWindow();
    }
  }
  lastOptimizeProgress: OptimizeProgress = {
    directory: '',
    directoryIndex: 0,
    totalDirectories: 0,
    file: '',
    fileIndex: 0,
    totalFiles: 0
  };
  notifyOptimizeProgress(progress: Partial<OptimizeProgress>) {
    Object.assign(this.lastOptimizeProgress, progress);
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send('image:optimizeProgress', this.lastOptimizeProgress);
      }
    });

  }
  notifyOptimizeFail(file: string) {
    const windows = BrowserWindow.getAllWindows();
    windows.forEach(window => {
      if (!window.isDestroyed()) {
        window.webContents.send('image:optimizeFail', file);
      }
    });
  }
}
