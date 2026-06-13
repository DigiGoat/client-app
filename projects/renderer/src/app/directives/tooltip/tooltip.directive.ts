import { Directive, ElementRef, HostBinding, HostListener, Input, type AfterViewInit, type OnDestroy, inject } from '@angular/core';
import type { Tooltip } from 'bootstrap';

@Directive({
  selector: '[tooltip]',
  standalone: false
})
export class TooltipDirective implements AfterViewInit, OnDestroy {
  private el = inject(ElementRef);

  private bsTooltip?: Tooltip;
  private _title = '';
  private _initialized = false;
  @Input('tooltip-placement') placement: 'auto' | 'top' | 'bottom' | 'left' | 'right' = 'auto';
  @Input() set tooltip(value: string) {
    this._title = value || '';
    if (this.bsTooltip) {
      if (this._title) {
        this.bsTooltip.setContent({ '.tooltip-inner': this._title });
      } else {
        this.bsTooltip.dispose();
        this.bsTooltip = undefined;
      }
    } else if (this._initialized && this._title) {
      this.bsTooltip = bootstrap.Tooltip.getOrCreateInstance(this.el.nativeElement, { placement: this.placement, title: this._title });
    }
  }
  @HostBinding('attr.data-bs-toggle') toggle = 'tooltip';
  @HostListener('click') onClick() {
    this.bsTooltip?.hide();
  }
  ngAfterViewInit(): void {
    this._initialized = true;
    if (this._title) {
      this.bsTooltip = bootstrap.Tooltip.getOrCreateInstance(this.el.nativeElement, { placement: this.placement, title: this._title });
    }
  }
  ngOnDestroy(): void {
    this.bsTooltip?.dispose();
  }

}
