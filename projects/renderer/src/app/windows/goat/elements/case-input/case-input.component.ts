import { ChangeDetectionStrategy, Component, EventEmitter, model, Output } from '@angular/core';

@Component({
  selector: 'app-case-input',
  templateUrl: './case-input.component.html',
  styleUrl: './case-input.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false
})
export class CaseInputComponent {
  @Output() valueChange = new EventEmitter<string>();

  signalValue = model<string>();

  invertSignalCase(index: number): void {
    const char = this.signalValue()![index];
    const newChar = char === char.toUpperCase() ? char.toLowerCase() : char.toUpperCase();
    this.signalValue.set(this.signalValue()!.slice(0, index) + newChar + this.signalValue()!.slice(index + 1));
  }
}
