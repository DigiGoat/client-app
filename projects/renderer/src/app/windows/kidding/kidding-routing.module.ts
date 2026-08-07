import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { KiddingComponent } from './kidding.component';

const routes: Routes = [
  { path: ':kidding', component: KiddingComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class KiddingRoutingModule { }
