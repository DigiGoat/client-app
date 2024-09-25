import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DragDropModule } from '@angular/cdk/drag-drop';
import { FormsModule } from '@angular/forms';
import { DirectivesModule } from '../../directives/directives.module';
import { PipesModule } from '../../pipes/pipes.module';
import { BasicGoatListComponent } from './elements/basic-goat-list/basic-goat-list.component';
import { GoatListComponent } from './elements/goat-list/goat-list.component';
import { GoatLookupComponent } from './elements/goat-lookup/goat-lookup.component';
import { GoatsComponent } from './goats/goats.component';
import { HomeComponent } from './home/home.component';
import { KiddingScheduleComponent } from './kidding-schedule/kidding-schedule.component';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { SettingsComponent } from './settings/settings.component';


@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    GoatsComponent,
    GoatListComponent,
    SettingsComponent,
    GoatLookupComponent,
    BasicGoatListComponent,
    KiddingScheduleComponent
  ],
  imports: [
    CommonModule,
    DirectivesModule,
    PipesModule,
    MainRoutingModule,
    FormsModule,
    DragDropModule
  ],
  exports: [MainComponent]
})
export class MainModule { }
