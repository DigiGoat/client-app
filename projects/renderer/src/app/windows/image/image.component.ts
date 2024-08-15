import { HttpClient } from '@angular/common/http';
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
  images: (Image & { src: string; })[] = [];
  constructor(private route: ActivatedRoute, private imageService: ImageService, private dialogService: DialogService, private cdr: ChangeDetectorRef, private gitService: GitService, private httpClient: HttpClient) {
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
    //this.cdr.detectChanges();
  }

  async uploadImage() {
    const images = await this.dialogService.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [{ name: 'Images', extensions: ['apng', 'png', 'avif', 'gif', 'jpg', 'jpeg', 'jfif', 'pjpeg', 'pjp', 'svg', 'webp', 'bmp', 'iso', 'cur', 'tif', 'tiff'] }, { name: 'All Files', extensions: ['*'] }] });
    const map = await this.imageService.getImageMap();
    if (!map[this.queries[0]]) map[this.queries[0]] = [];
    const paths: string[] = [];
    let i = 0;
    const timestamp = Date.now();
    for (const image of images.filePaths) {
      const name = `${timestamp}-${i}${await this.imageService.getExtension(image)}`;
      const path = `${this.queries[0]}/${name}`;
      this.imageService.writeImage(path, await this.imageService.readImage(image));
      map[this.queries[0]].push({ file: name });
      paths.push(path);
      i++;
    }
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages(paths, [`Added Images To ${this.queries[this.queries.length - 1]}`, ...paths.map(path => `      Added ${path}`)]);
  }

  //Handle the drop event
  async importImage(event: DragEvent) {
    const files = Array.from(event.dataTransfer!.files);
    event.preventDefault();
    event.stopPropagation();
    const map = await this.imageService.getImageMap();
    if (!map[this.queries[0]]) map[this.queries[0]] = [];
    const paths: string[] = [];
    let i = 0;
    const timestamp = Date.now();
    for (const file of files) {
      const name = `${timestamp}-${i}${await this.imageService.getExtension(file.path)}`;
      const path = `${this.queries[0]}/${name}`;
      this.imageService.writeImage(path, await this.imageService.readImage(file.path));
      map[this.queries[0]].push({ file: name });
      paths.push(path);
      i++;
    }
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages(paths, [`Added Images To ${this.queries[this.queries.length - 1]}`, ...paths.map(path => `      Added ${path}`)]);
  }

  async downloadImage(input: HTMLInputElement, button: HTMLButtonElement) {
    if (!input.value) return;
    button.disabled = true;
    this.httpClient.get(input.value, { responseType: 'arraybuffer' }).subscribe({
      next: async response => {
        const base64Data = this.imageService.stringToBase64(response);
        const name = `${Date.now()}${this.imageService.getExtension(input.value)}`;
        const path = `${this.queries[0]}/${name}`;
        this.imageService.writeImage(path, base64Data);
        const map = await this.imageService.getImageMap();
        if (!map[this.queries[0]]) map[this.queries[0]] = [];
        map[this.queries[0]].push({ file: name });
        await this.imageService.setImageMap(map);
        await this.gitService.commitImages([path], [`Downloaded Image To ${this.queries[0]}`, `Downloaded ${path}`]);
        button.disabled = false;
      },
      error: error => {
        console.error(error);
        this.dialogService.showMessageBox({ type: 'error', message: 'Failed To Download Image', detail: error.message });
        button.disabled = false;
      }
    });
    input.value = '';
  }
  async deleteImage(file: string) {
    const map = await this.imageService.getImageMap();
    for (const query of this.queries) {
      if (map[query]) {
        map[query].splice(map[query].findIndex(image => file.endsWith(image.file)), 1);
      }
    }
    await this.imageService.setImageMap(map);
    await this.imageService.deleteImage(file);
    await this.gitService.commitImages([file], [`Deleted Image From ${this.queries[this.queries.length - 1]}`, `Deleted ${file}`]);
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
    await this.gitService.commitImages([], [`Updated Image Alt For ${this.queries[this.queries.length - 1]}`, oldAlt ? `Updated Image Alt From "${oldAlt}" To "${image.alt}"` : `Set Image Alt To "${image.alt}"`]);
  }
  paste(element: HTMLInputElement, event: ClipboardEvent) {
    event.preventDefault();
    const text = event.clipboardData!.getData('text');
    element.value = text;
    element.dispatchEvent(new Event('input'));
    element.blur();
    element.focus();
  }
  async showClipboard(element: HTMLInputElement, param: 'placeholder' | 'value') {
    const clipboard = await navigator.clipboard.readText();
    element[param] = clipboard;
    if (param === 'value') element.focus();
  }
  async makePrimary(image: (Image & { src: string; })) {
    const map = await this.imageService.getImageMap();
    for (const query of this.queries) {
      if (map[query]) {
        const index = map[query].findIndex(_image => image.file.endsWith(_image.file));
        if (index !== -1) {
          map[query].splice(index, 1);
        }
      }
    }
    await this.imageService.deleteImage(image.file);
    if (!map[this.queries[0]]) map[this.queries[0]] = [];
    image.file = image.file.split('/').slice(2).join('/');
    this.imageService.writeImage(`${this.queries[0]}/${image.file}`, image.src);
    delete (image as { src?: string; }).src;
    map[this.queries[0]].unshift(image);
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages([`${this.queries[0]}/${image.file}`], [`Made Image Primary For ${this.queries[this.queries.length - 1]}`, `Made ${image.file} Primary`]);
  }
}
