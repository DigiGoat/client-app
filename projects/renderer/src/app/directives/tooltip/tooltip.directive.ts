import { Directive, ElementRef, HostBinding, HostListener, Input, type AfterViewInit, type OnDestroy } from '@angular/core';
import type { Tooltip } from 'bootstrap';

@Directive({
  selector: '[tooltip]',
  standalone: false
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  private bsTooltip?: Tooltip;
  @Input('tooltip-placement') placement: 'auto' | 'top' | 'bottom' | 'left' | 'right' = 'auto';
  @Input() set tooltip(value: string) {
    if (this.bsTooltip) {
      this.bsTooltip.setContent({ '.tooltip-inner': value });
    } else {
      this.el.nativeElement.setAttribute('data-bs-title', value);
    }
  }
  @HostBinding('attr.data-bs-toggle') toggle = 'tooltip';
  @HostListener('click') onClick() {
    this.bsTooltip?.hide();
  }
  constructor(private el: ElementRef) { }
  ngAfterViewInit(): void {
    this.bsTooltip = bootstrap.Tooltip.getOrCreateInstance(this.el.nativeElement, { placement: this.placement });
  }
  ngOnDestroy(): void {
    this.bsTooltip?.dispose();
  }

}
