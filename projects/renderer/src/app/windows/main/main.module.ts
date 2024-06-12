import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { SuggestionDirective } from '../../directives/suggestion/suggestion.directive';
import { GoatsComponent } from './goats/goats.component';
import { HomeComponent } from './home/home.component';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';


@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    GoatsComponent,
    SuggestionDirective
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ],
  exports: [MainComponent]
})
export class MainModule { }
