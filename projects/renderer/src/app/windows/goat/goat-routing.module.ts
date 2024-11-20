import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuckComponent } from './buck/buck.component';
import { DoeComponent } from './doe/doe.component';
import { RelatedComponent } from './related/related.component';

const routes: Routes = [
  { path: 'doe/:goat', component: DoeComponent },
  { path: 'buck/:goat', component: BuckComponent },
  { path: 'related/:goat', component: RelatedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoatRoutingModule { }
