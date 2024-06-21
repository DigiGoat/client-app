import { NgModule } from '@angular/core';
import { SuggestionDirective } from './suggestion/suggestion.directive';
import { TextareaDirective } from './textarea/textarea.directive';



@NgModule({
  declarations: [
    SuggestionDirective,
    TextareaDirective
  ],
  imports: [],
  exports: [
    SuggestionDirective,
    TextareaDirective
  ]
})
export class DirectivesModule { }
