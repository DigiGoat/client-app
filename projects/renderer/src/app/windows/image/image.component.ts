import { moveItemInArray, transferArrayItem, type CdkDragDrop } from '@angular/cdk/drag-drop';
import { HttpClient } from '@angular/common/http';
import { Component, type OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { type ImageMap } from '../../../../../shared/services/image/image.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DiffService } from '../../services/diff/diff.service';
import { GitService } from '../../services/git/git.service';
import { ImageService } from '../../services/image/image.service';

@Component({
  selector: 'app-image',
  templateUrl: './image.component.html',
  styleUrl: './image.component.scss',
  standalone: false
})
export class ImageComponent implements OnInit {
  queries: string[] = [];
  imageMap: ImageMap = {};
  constructor(private route: ActivatedRoute, private imageService: ImageService, private dialogService: DialogService, private gitService: GitService, private httpClient: HttpClient, private diffService: DiffService) {
  }
  async ngOnInit() {
    this.queries = this.route.snapshot.queryParamMap.keys;
    this.updateImages();
    this.imageService.onchange = (imageMap) => this.updateImages(imageMap);
  }
  async updateImages(imageMap?: ImageMap) {
    this.imageMap = imageMap ?? await this.imageService.getImageMap();
  }

  async uploadImage() {
    const images = await this.dialogService.showOpenDialog({ properties: ['openFile', 'multiSelections'], filters: [this.dialogService.FILTERS.IMAGES, this.dialogService.FILTERS.ALL] });
    const map = await this.imageService.getImageMap();
    if (!map[this.queries[0]]) map[this.queries[0]] = [];
    const names = await this.imageService.addImages(this.queries[0], ...images.filePaths);
    map[this.queries[0]].unshift(...names.map(name => ({ file: name })));
    const paths = names.map(name => `${this.queries[0]}/${name}`);
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages(paths, [`Added Images To ${this.queries[this.queries.length - 1]}`, ...paths.map(path => `${this.diffService.spaces}Added ${path}`)]);
  }

  //Handle the drop event
  async importImage(event: DragEvent) {
    const files = Array.from(event.dataTransfer!.files);
    event.preventDefault();
    event.stopPropagation();
    const map = await this.imageService.getImageMap();
    if (!map[this.queries[0]]) map[this.queries[0]] = [];
    const names = await this.imageService.addImages(this.queries[0], ...files);
    map[this.queries[0]].unshift(...names.map(name => ({ file: name })));

    const paths = names.map(name => `${this.queries[0]}/${name}`);
    await this.imageService.setImageMap(map);
    await this.gitService.commitImages(paths, [`Added Images To ${this.queries[this.queries.length - 1]}`, ...paths.map(path => `${this.diffService.spaces}Added ${path}`)]);
  }

  async downloadImage(input: HTMLInputElement, button: HTMLButtonElement) {
    if (!input.value) return;
    button.disabled = true;
    this.httpClient.get(input.value, { responseType: 'arraybuffer' }).subscribe({
      next: async response => {
        const image = (await this.imageService.addImages(this.queries[0], response))[0];
        const map = await this.imageService.getImageMap();
        if (!map[this.queries[0]]) map[this.queries[0]] = [];
        map[this.queries[0]].unshift({ file: image });
        await this.imageService.setImageMap(map);
        await this.gitService.commitImages([`${this.queries[0]}/${image}`], [`Downloaded Image To ${this.queries[0]}`, `Downloaded ${image}`]);
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
  async deleteImage(directory: string, image: string) {
    const map = await this.imageService.getImageMap();
    map[directory] = map[directory].filter(file => file.file !== image);
    await this.imageService.setImageMap(map);
    await this.imageService.deleteImages(directory, [image]);
    await this.gitService.commitImages([`${directory}/${image}`], [`Deleted Image From ${this.queries[this.queries.length - 1]}`, `Deleted ${image} From ${directory}`]);
  }
  async moveImage(event: CdkDragDrop<string, string, string>) {
    const oldQuery = event.previousContainer.data;
    const newQuery = event.container.data;
    if (event.previousContainer === event.container) {
      if (event.previousIndex === event.currentIndex) return;
      moveItemInArray(this.imageMap[newQuery], event.previousIndex, event.currentIndex);
      await this.imageService.setImageMap(this.imageMap);
      await this.gitService.commitImages([], [`Moved Image For ${this.queries[this.queries.length - 1]}`, `Moved ${event.item.data} From Position ${event.previousIndex} To ${event.currentIndex}`]);
    } else {
      await this.imageService.mvImage(oldQuery, newQuery, event.item.data);
      transferArrayItem(
        this.imageMap[oldQuery],
        this.imageMap[newQuery],
        event.previousIndex,
        event.currentIndex,
      );
      await this.imageService.setImageMap(this.imageMap);
      await this.gitService.commitImages([`${oldQuery}/${event.item.data}`], [`Moved Image For ${this.queries[this.queries.length - 1]}`, `Moved ${event.item.data} From ${oldQuery} To ${newQuery}`]);
    }
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
}
