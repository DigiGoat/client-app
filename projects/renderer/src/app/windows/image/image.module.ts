import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { DirectivesModule } from '../../directives/directives.module';
import { ImageRoutingModule } from './image-routing.module';
import { ImageComponent } from './image.component';
import { FormsModule } from '@angular/forms';


@NgModule({
  declarations: [
    ImageComponent
  ],
  imports: [
    CommonModule,
    ImageRoutingModule,
    DirectivesModule,
    FormsModule
  ]
})
export class ImageModule { }
