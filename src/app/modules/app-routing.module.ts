import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { MainViewComponent } from '../components/main-view/main-view.component';

import { enableProdMode } from '@angular/core';

enableProdMode();

const routes: Routes = [
  { path: '', component: MainViewComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {useHash: true})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
