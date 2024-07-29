import { ChangeDetectorRef, Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Image } from '../../../../../shared/services/image/image.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { GitService } from '../../services/git/git.service';
import { ImageService } from '../../services/image/image.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss'
})
export class ImageComponent implements OnInit {
  queries: string[] = [];
  oldImages: (Image & { src: string; })[] = [];
  images: (Image & { src: string; })[] = [];
  constructor(private route: ActivatedRoute, private imageService: ImageService, private dialogService: DialogService, private cdr: ChangeDetectorRef, private gitService: GitService) {
  }
  async ngOnInit() {
    this.queries = this.route.snapshot.queryParamMap.keys;
    this.updateImages();
    this.imageService.onchange = () => this.updateImages();
  }
  async updateImages() {
    const images = await this.imageService.getImages(this.queries) as (Image & { src: string; })[];
    for (const image of images) {
      image.src = await this.imageService.readLocalImage(image.file);
    }
    this.images = images;
    this.cdr.detectChanges();
  }

  async uploadImage() {
    const images = await this.dialogService.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['apng', 'png', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'svg', 'webp', 'bmp', 'iso', 'cur', 'tif', 'tiff'] }, { name: 'All Files', extensions: ['*'] }] });
    const map = await this.imageService.getImageMap();
    if (!map[this.queries[0]]) map[this.queries[0]] = [];
    const paths: string[] = [];
    for (const image of images.filePaths) {
      const name = (new Date()).toString();
      const path = `${this.queries[0]}/${name}`;
      this.imageService.writeImage(path, await this.imageService.readImage(image));
      map[this.queries[0]].push({ file: name });
      paths.push(path);
    }
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages(paths, [`Added Images To ${this.queries[0]}`, ...paths.map(path => `      Added ${path}`)]);
  }
  /*
    async downloadImage(url: string) {
       const image = await new Promise((resolve, reject) => this.http.get(url).subscribe({ next: resolve, error: reject }));
    }
  */
  async deleteImage(file: string) {
    const map = await this.imageService.getImageMap();
    for (const query of this.queries) {
      if (map[query]) {
        map[query].splice(map[query].findIndex(image => file.endsWith(image.file)), 1);
      }
    }
    await this.imageService.setImageMap(map);
    await this.imageService.deleteImage(file);
    await this.gitService.commitImages([file], [`Deleted Image From ${this.queries[0]}`, `Deleted ${file}`]);
  }
  async setImage(image: (Image & { src: string; })) {
    const map = await this.imageService.getImageMap();
    const keys = Object.keys(map).filter(directory => this.queries.includes(directory));
    let oldAlt;
    for (const key of keys) {
      if (map[key].length) {
        const index = map[key].findIndex(_image => image.file.endsWith(_image.file));
        if (index !== -1) {
          oldAlt = map[key][index].alt;
          map[key][index].alt = image.alt;
        }
      }
    }
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages([], [`Updated Image Alt For ${this.queries[0]}`, oldAlt ? `Updated Image Alt From "${oldAlt}" To "${image.alt}"` : `Set Image Alt To "${image.alt}"`]);
  }
}
