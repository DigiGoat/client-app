import { ChangeDetectionStrategy, Component, EventEmitter, Input, model, Output } from '@angular/core';

@Component({
  selector: 'app-case-input',
  templateUrl: './case-input.component.html',
  styleUrl: './case-input.component.scss',
  changeDetection: ChangeDetectionStrategy.Eager,
  standalone: false
})
export class CaseInputComponent {
  @Input() value?: string;
  @Output() valueChange = new EventEmitter<string>();

  signalValue = model<string>();

  invertCase(index: number): void {
    const char = this.value![index];
    const newChar = char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    this.value = this.value!.slice(0, index) + newChar + this.value!.slice(index + 1);
    this.valueChange.emit(this.value);
  }

  invertSignalCase(index: number): void {
    const char = this.signalValue()![index];
    const newChar = char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    this.signalValue.set(this.signalValue()!.slice(0, index) + newChar + this.signalValue()!.slice(index + 1));
  }
}
