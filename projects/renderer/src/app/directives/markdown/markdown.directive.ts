import { HttpClient } from '@angular/common/http';
import { booleanAttribute, Directive, ElementRef, HostListener, Input, type OnInit } from '@angular/core';
import { AppService } from '../../services/app/app.service';
import { DialogService } from '../../services/dialog/dialog.service';
import { DiffService } from '../../services/diff/diff.service';
import { GitService } from '../../services/git/git.service';
import { ImageService } from '../../services/image/image.service';
import { MarkedService } from '../../services/marked/marked.service';

@Directive({
  selector: 'textarea[markdown]',
  standalone: false
})
export class MarkdownDirective implements OnInit {

  constructor(private el: ElementRef<HTMLTextAreaElement>, private http: HttpClient, private appService: AppService, private markedService: MarkedService, private dialogService: DialogService, private imageService: ImageService, private gitService: GitService, private diffService: DiffService) { }
  private markdownEl!: HTMLElement;
  private iconEl!: HTMLElement;
  private imageIconEl?: HTMLElement;
  private descriptor?: HTMLElement;

  @Input({ alias: 'markdown-images', transform: booleanAttribute }) imagesUploads = false;

  async ngOnInit() {
    this.descriptor = this.el.nativeElement.previousElementSibling as HTMLElement;

    this.markdownEl = this.el.nativeElement.ownerDocument.createElement('div');
    this.markdownEl.className = this.el.nativeElement.className + ' blocked-link' + ' text-center';
    this.markdownEl.style.cursor = 'text';
    this.markdownEl.style.maxHeight = '50vh';
    this.markdownEl.style.overflow = 'auto';
    this.el.nativeElement.insertAdjacentElement('beforebegin', this.markdownEl);
    this.markdownEl.style.display = 'none';
    this.markdownEl.addEventListener('click', () => this.hideMarkdown());
    //Wait 100ms so that Angular has a chance to bind to `ngModel`
    this.iconEl = this.el.nativeElement.ownerDocument.createElement('i');
    this.iconEl.className = 'bi bi-markdown';
    this.iconEl.style.position = 'absolute';
    this.iconEl.style.top = '1px';
    this.iconEl.style.right = '5px';
    this.iconEl.style.backgroundColor = 'transparent';
    //this.iconEl.style.opacity = '0.5';
    this.iconEl.title = 'Markdown Supported';
    this.iconEl.style.zIndex = '100';
    this.iconEl.style.cursor = 'help';

    if (this.imagesUploads) {
      this.imageIconEl = this.el.nativeElement.ownerDocument.createElement('i');
      this.imageIconEl.className = 'bi bi-image';
      this.imageIconEl.style.position = 'absolute';
      this.imageIconEl.style.top = '1px';
      this.imageIconEl.style.right = '25px';
      this.imageIconEl.style.backgroundColor = 'transparent';
      this.imageIconEl.title = 'Images Supported';
      this.imageIconEl.style.zIndex = '100';
      this.imageIconEl.style.cursor = 'copy';
      this.imageIconEl.addEventListener('click', () => this.uploadImages());
      this.el.nativeElement.insertAdjacentElement('beforebegin', this.imageIconEl);
      bootstrap.Tooltip.getOrCreateInstance(this.imageIconEl);
    }

    this.el.nativeElement.style.whiteSpace = 'pre';
    this.iconEl.addEventListener('click', () => this.appService.openMarkdown());
    this.el.nativeElement.insertAdjacentElement('beforebegin', this.iconEl);
    bootstrap.Tooltip.getOrCreateInstance(this.iconEl);
    setTimeout(() => this.showMarkdown(), 100);
  }
  oldValue = '';
  async showMarkdown() {
    const value = this.el.nativeElement.value;
    if (value) {
      try {
        if (value !== this.oldValue) {
          this.iconEl.classList.remove('text-success', 'text-warning');
          this.iconEl.classList.add('text-danger');
          this.markdownEl.innerHTML = this.markedService.parse(value);
          this.markdownEl.style.display = 'block';
          this.el.nativeElement.style.display = 'none';
          this.iconEl.classList.remove('text-danger', 'text-success');
          this.iconEl.classList.add('text-warning');
          try {
            this.markdownEl.innerHTML = await this.renderMarkdown(value);
            this.iconEl.classList.remove('text-danger', 'text-warning');
            this.iconEl.classList.add('text-success');
            this.oldValue = value;
          } catch (error) {
            console.warn('Failed to render markdown', error);
          }
        } else {
          this.iconEl.classList.remove('text-danger', 'text-warning', 'text-success');
          this.iconEl.classList.add('text-info');
          this.markdownEl.style.display = 'block';
          this.el.nativeElement.style.display = 'none';
        }
        this.renderImages();
        this.descriptor?.classList.remove('d-none');
      } catch (error) {
        this.iconEl.classList.remove('text-success', 'text-warning');
        this.iconEl.classList.add('text-danger');
        this.hideMarkdown();
      }
    }
  }
  async hideMarkdown() {
    this.el.nativeElement.style.display = 'block';
    this.markdownEl.style.display = 'none';
    this.descriptor?.classList.add('d-none');
    this.iconEl.classList.remove('text-success', 'text-danger', 'text-warning');
    this.imageIconEl?.classList.remove('text-success', 'text-danger');
    this.el.nativeElement.focus();
  }

  renderImages() {
    if (this.imagesUploads) {
      this.imageIconEl!.classList.remove('text-success', 'text-danger');
      try {
        const images = this.markdownEl.querySelectorAll('img');
        images.forEach(img => {
          const src = img.getAttribute('src');
          if (src && !/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(src)) {
            img.setAttribute('src', `image:${src.replace('./assets/images', '')}`);
          }
        });
        if (images.length) {
          this.imageIconEl!.classList.add('text-success');
        }
      } catch (error) {
        this.imageIconEl!.classList.add('text-danger');
        console.error('Failed to render images', error);
      }
    }
  }

  @HostListener('blur') async onBlur() {
    if (!this.uploading) {
      await this.showMarkdown();
    }
  }
  async renderMarkdown(markdown: string) {
    return await new Promise<string>((resolve, reject) => {
      this.http.post('https://api.github.com/markdown', { text: markdown, mode: 'gfm' }, { responseType: 'text' }).subscribe({
        next: response => {
          resolve(response);
        }, error: reject
      });
    });
  }
  private uploading = false;
  async uploadImages() {
    this.hideMarkdown();
    this.uploading = true;
    const uploadDir = await this.imageService.getUploadDir();
    const images = await this.dialogService.showOpenDialog({
      properties: ['openFile', 'multiSelections'],
      buttonLabel: 'Upload',
      filters: [this.dialogService.FILTERS.IMAGES, this.dialogService.FILTERS.ALL],
      defaultPath: uploadDir
    });
    this.uploading = false;
    if (images && images.filePaths.length) {
      // Identify all the images whose filepath is within the upload directory as they don't need to be re-uploaded, they just need to be added to the textarea. It should be sufficient to use startsWith
      const existingPaths = images.filePaths.filter(filePath => filePath.startsWith(uploadDir));
      console.log('Existing Image Paths:', existingPaths);
      for (const path of existingPaths) {
        const startPos = this.el.nativeElement.selectionStart;
        const endPos = this.el.nativeElement.selectionEnd;
        const text = this.el.nativeElement.value;
        const formattedPath = path.replace(uploadDir, '').replace(/\\/g, '/');
        this.el.nativeElement.value = text.substring(0, startPos) + `${startPos === endPos ? '\n' : ''}![Image Description Here](./assets/images/uploads${formattedPath})` + text.substring(endPos);
      }
      const newPaths = images.filePaths.filter(filePath => !existingPaths.includes(filePath));
      if (newPaths.length) {
        const paths = await this.imageService.uploadImages(...newPaths);
        console.log('Uploaded Image Paths:', paths);
        for (const path of paths) {
          const startPos = this.el.nativeElement.selectionStart;
          const endPos = this.el.nativeElement.selectionEnd;
          const text = this.el.nativeElement.value;
          this.el.nativeElement.value = text.substring(0, startPos) + `${startPos === endPos ? '\n' : ''}![Image Description Here](./assets/images/${path})` + text.substring(endPos);
          //this.el.nativeElement.value = `![Image Description Here](${path})\n` + this.el.nativeElement.value;
        }
        await this.gitService.commitImages(paths, ['Uploaded Images', ...paths.map(path => `${this.diffService.spaces}Added ${path}`)]);
      }
      this.el.nativeElement.dispatchEvent(new Event('input'));
      this.hideMarkdown();
    }
  }
}
