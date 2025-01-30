import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { BuckComponent } from './buck/buck.component';
import { DoeComponent } from './doe/doe.component';
import { RelatedComponent } from './related/related.component';
import { ReferenceComponent } from './reference/reference.component';

const routes: Routes = [
  { path: 'doe/:goat', component: DoeComponent },
  { path: 'buck/:goat', component: BuckComponent },
  { path: 'reference/:goat', component: ReferenceComponent },
  { path: 'related/:goat', component: RelatedComponent }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class GoatRoutingModule { }
