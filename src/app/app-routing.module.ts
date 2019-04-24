import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './component/home-page/home-page.component';
import { ResultsComponent } from './component/results/results.component';
import { TestResultsComponent } from './component/test-results/test-results.component';
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
    path: 'publications',
    component: PublicationsComponent
  },
  {
    path: 'results/:name',
    component: ResultsComponent
  },
  {
    path: 'test-results',
    component: TestResultsComponent
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
