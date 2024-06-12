import { Directive, ElementRef, HostBinding, HostListener, type OnInit } from '@angular/core';

@Directive({
  selector: 'textarea'
})
export class TextareaDirective implements OnInit {
  @HostBinding('style.resize') resize = 'none';
  @HostBinding('style.overflow-y') overflowY = 'hidden';
  @HostBinding('style.word-wrap') wordWrap = 'break-word';
  @HostListener('input') onInput() {
    this.adjust();
  }
  @HostListener('window:resize') onResize() {
    this.adjust();
  }
  constructor(private el: ElementRef<HTMLTextAreaElement>) {
  }
  ngOnInit() {
    this.adjust();
  }
  adjust() {
    this.el.nativeElement.style.height = 'auto';
    this.el.nativeElement.style.height = `${this.el.nativeElement.scrollHeight}px`;
  }
}
