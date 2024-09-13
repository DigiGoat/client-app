import { HttpClientModule } from '@angular/common/http';
import { NgModule } from '@angular/core';
import { AdvancedDirective } from './advanced/advanced.directive';
import { MarkdownDirective } from './markdown/markdown.directive';
import { OnlineOnlyDirective } from './online-only/online-only.directive';
import { SuggestionDirective } from './suggestion/suggestion.directive';
import { TextareaDirective } from './textarea/textarea.directive';
import { TooltipDirective } from './tooltip/tooltip.directive';



@NgModule({
  declarations: [
    SuggestionDirective,
    TextareaDirective,
    TooltipDirective,
    OnlineOnlyDirective,
    AdvancedDirective,
    MarkdownDirective
  ],
  imports: [
    HttpClientModule
  ],
  exports: [
    SuggestionDirective,
    TextareaDirective,
    TooltipDirective,
    OnlineOnlyDirective,
    AdvancedDirective,
    MarkdownDirective
  ]
})
export class DirectivesModule { }
