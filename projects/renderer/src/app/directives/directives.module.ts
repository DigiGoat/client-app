import { NgModule } from '@angular/core';
import { OnlineOnlyDirective } from './online-only/online-only.directive';
import { SuggestionDirective } from './suggestion/suggestion.directive';
import { TextareaDirective } from './textarea/textarea.directive';
import { TooltipDirective } from './tooltip/tooltip.directive';



@NgModule({
  declarations: [
    SuggestionDirective,
    TextareaDirective,
    TooltipDirective,
    OnlineOnlyDirective
  ],
  imports: [],
  exports: [
    SuggestionDirective,
    TextareaDirective,
    TooltipDirective,
    OnlineOnlyDirective
  ]
})
export class DirectivesModule { }
