import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { GoatListComponent } from './elements/goat-list/goat-list.component';
import { GoatsComponent } from './goats/goats.component';
import { HomeComponent } from './home/home.component';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    GoatsComponent,
    GoatListComponent,
    SettingsComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule,
    MainRoutingModule,
    FormsModule
  ],
  exports: [MainComponent]
})
export class MainModule { }
