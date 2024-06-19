import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { SaveGuard } from '../../guards/save/save.guard';
import { GoatsComponent } from './goats/goats.component';
import { HomeComponent } from './home/home.component';
import { MainComponent } from './main.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: 'home', component: HomeComponent, canDeactivate: [SaveGuard] },
      { path: 'goats', component: GoatsComponent },
      { path: '', redirectTo: '/main/home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
