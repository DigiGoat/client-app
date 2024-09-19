import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { kiddingSaverGuard } from '../../guards/kidding-saver/kidding-saver.guard';
import { SaveGuard } from '../../guards/save/save.guard';
import { GoatsComponent } from './goats/goats.component';
import { HomeComponent } from './home/home.component';
import { KiddingScheduleComponent } from './kidding-schedule/kidding-schedule.component';
import { MainComponent } from './main.component';
import { SettingsComponent } from './settings/settings.component';

const routes: Routes = [
  {
    path: '', component: MainComponent, children: [
      { path: 'home', component: HomeComponent, canDeactivate: [SaveGuard] },
      { path: 'goats', component: GoatsComponent },
      { path: 'settings', component: SettingsComponent },
      { path: 'kidding-schedule', component: KiddingScheduleComponent, canDeactivate: [kiddingSaverGuard] },
      { path: '', redirectTo: '/main/home', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class MainRoutingModule { }
