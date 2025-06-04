import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ImageComponent } from './image.component';
import { OptimizeComponent } from './optimize/optimize.component';

const routes: Routes = [
  { path: 'optimize', component: OptimizeComponent },
  { path: '', component: ImageComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class ImageRoutingModule { }
