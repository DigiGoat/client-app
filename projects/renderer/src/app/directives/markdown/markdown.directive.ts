import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, HostListener, type OnInit } from '@angular/core';
import { AppService } from '../../services/app/app.service';
import { MarkedService } from '../../services/marked/marked.service';

@Directive({
  selector: 'textarea[markdown]',
  standalone: false
})
export class MarkdownDirective implements OnInit {

  constructor(private el: ElementRef<HTMLTextAreaElement>, private http: HttpClient, private appService: AppService, private markedService: MarkedService) { }
  private markdownEl!: HTMLElement;
  private iconEl!: HTMLElement;

  async ngOnInit() {
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
    //this.iconEl.style.opacity = '0.5';
    this.iconEl.title = 'Markdown Supported';
    this.iconEl.style.zIndex = '1';
    this.iconEl.style.cursor = 'help';
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
          this.markdownEl.innerHTML = await this.renderMarkdown(value);
          this.oldValue = value;
        }
        this.markdownEl.style.display = 'block';
        this.el.nativeElement.style.display = 'none';
        this.iconEl.classList.remove('text-danger', 'text-warning');
        this.iconEl.classList.add('text-success');
      } catch (error) {
        try {
          this.iconEl.classList.remove('text-success', 'text-warning');
          this.iconEl.classList.add('text-danger');
          this.markdownEl.innerHTML = this.markedService.parse(value);
          this.markdownEl.style.display = 'block';
          this.el.nativeElement.style.display = 'none';
          this.iconEl.classList.remove('text-danger', 'text-success');
          this.iconEl.classList.add('text-warning');
        } catch (error2) {
          console.error('Failed to render markdown', error, error2);
        }
      }
    }
  }
  async hideMarkdown() {
    this.el.nativeElement.style.display = 'block';
    this.markdownEl.style.display = 'none';
    this.iconEl.classList.remove('text-success', 'text-danger', 'text-warning');
    this.el.nativeElement.focus();
  }

  @HostListener('blur') async onBlur() {
    await this.showMarkdown();
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

}
