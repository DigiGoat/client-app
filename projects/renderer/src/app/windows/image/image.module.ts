import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';

import { FormsModule } from '@angular/forms';
import { ImageRoutingModule } from './image-routing.module';
import { ImageComponent } from './image.component';
import { DirectivesModule } from '../../directives/directives.module';


@NgModule({
  declarations: [
    ImageComponent
  ],
  imports: [
    CommonModule,
    ImageRoutingModule,
    FormsModule,
    DirectivesModule
  ]
})
export class ImageModule { }
