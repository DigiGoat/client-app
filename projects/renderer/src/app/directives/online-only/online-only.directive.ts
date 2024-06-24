import { ChangeDetectorRef, Directive, ElementRef, HostListener, type OnInit } from '@angular/core';

@Directive({
  selector: '[online-only]'
})
export class OnlineOnlyDirective implements OnInit {
  @HostListener('window:offline') onOffline() {
    this.el.nativeElement.setAttribute('was-disabled', String(this.el.nativeElement.disabled));
    this.el.nativeElement.parentElement?.setAttribute('old-tooltip', this.el.nativeElement.parentElement!.getAttribute('tooltip') || '');
    if (this.el.nativeElement.classList.contains('show')) {
      this.el.nativeElement.click();
    }
    this.el.nativeElement.disabled = true;
    this.el.nativeElement.parentElement?.setAttribute('tooltip', 'Internet Required');
  }
  @HostListener('window:online') onOnline() {
    this.el.nativeElement.disabled = this.el.nativeElement.getAttribute('was-disabled') === 'true';
    this.el.nativeElement.parentElement?.setAttribute('tooltip', this.el.nativeElement.parentElement!.getAttribute('old-tooltip') || '');
  }
  constructor(private el: ElementRef<HTMLButtonElement>, private cdr: ChangeDetectorRef) { }
  ngOnInit() {
    this.el.nativeElement.setAttribute('was-disabled', String(this.el.nativeElement.disabled));
    this.el.nativeElement.parentElement?.setAttribute('old-tooltip', this.el.nativeElement.parentElement!.getAttribute('tooltip') || '');
    this.el.nativeElement.disabled = !navigator.onLine;
    if (!navigator.onLine) {
      this.el.nativeElement.parentElement?.setAttribute('tooltip', 'Internet Required');
    }
    this.cdr.detectChanges();
  }
}
