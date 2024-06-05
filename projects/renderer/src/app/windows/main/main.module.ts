import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { HomeComponent } from './home/home.component';
import { MainRoutingModule } from './main-routing.module';
import { MainComponent } from './main.component';
import { GoatsComponent } from './goats/goats.component';


@NgModule({
  declarations: [
    HomeComponent,
    MainComponent,
    GoatsComponent
  ],
  imports: [
    CommonModule,
    MainRoutingModule
  ],
  exports: [MainComponent]
})
export class MainModule { }
