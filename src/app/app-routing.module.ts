import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './component/home-page/home-page.component';
import { ResultsComponent } from './component/results/results.component';
import { JulkaisuComponent } from './component/julkaisu/julkaisu.component';
import { PublicationsComponent } from './component/publications/publications.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePageComponent
  },
  {
    path: 'results',
    component: ResultsComponent
  },
  {
    path: 'julkaisut',
    component: JulkaisuComponent
  },
  {
    path: 'publications',
    component: PublicationsComponent
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
