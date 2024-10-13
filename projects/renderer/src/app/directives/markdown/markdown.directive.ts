import { HttpClient } from '@angular/common/http';
import { Directive, ElementRef, HostListener, type OnInit } from '@angular/core';
import { AppService } from '../../services/app/app.service';

@Directive({
  selector: 'textarea[markdown]'
})
export class MarkdownDirective implements OnInit {

  constructor(private el: ElementRef<HTMLTextAreaElement>, private http: HttpClient, private appService: AppService) { }
  private markdownEl!: HTMLElement;

  async ngOnInit() {
    this.markdownEl = this.el.nativeElement.ownerDocument.createElement('div');
    this.markdownEl.className = this.el.nativeElement.className + ' blocked-link'; // + ' text-center';
    this.markdownEl.style.cursor = 'text';
    this.el.nativeElement.insertAdjacentElement('beforebegin', this.markdownEl);
    this.markdownEl.style.display = 'none';
    this.markdownEl.addEventListener('click', () => this.hideMarkdown());
    //Wait 100ms so that Angular has a chance to bind to `ngModel`
    const iconEl = this.el.nativeElement.ownerDocument.createElement('i');
    iconEl.className = 'bi bi-markdown';
    iconEl.style.position = 'absolute';
    iconEl.style.top = '1px';
    iconEl.style.right = '5px';
    iconEl.style.opacity = '0.5';
    iconEl.title = 'Markdown Supported';
    iconEl.style.zIndex = '1';
    iconEl.style.cursor = 'help';
    iconEl.addEventListener('click', () => this.appService.openMarkdown());
    this.el.nativeElement.insertAdjacentElement('beforebegin', iconEl);
    bootstrap.Tooltip.getOrCreateInstance(iconEl);
    setTimeout(() => this.showMarkdown(), 100);
  }
  oldValue = '';
  async showMarkdown() {
    const value = this.el.nativeElement.value;
    if (value) {
      if (value !== this.oldValue) {
        this.oldValue = value;
        this.markdownEl.innerHTML = await this.renderMarkdown(value);
      }
      this.markdownEl.style.display = 'block';
      this.el.nativeElement.style.display = 'none';
    }
  }
  async hideMarkdown() {
    this.el.nativeElement.style.display = 'block';
    this.markdownEl.style.display = 'none';
    this.el.nativeElement.focus();
  }

  @HostListener('blur') async onBlur() {
    await this.showMarkdown();
  }
  async renderMarkdown(markdown: string) {
    return await new Promise<string>(resolve => {
      this.http.post('https://api.github.com/markdown', { text: markdown, mode: 'gfm' }, { responseType: 'text' }).subscribe(response => {
        resolve(response);
      });
    });
  }

}
