// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './component/home-page/home-page.component';
import { ResultsComponent } from './component/results/results.component';
import { SingleComponent } from './component/single/single.component';

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
    path: 'results/:tab',
    component: ResultsComponent
  },
  {
    path: 'results/:tab/:input',
    component: ResultsComponent
  },
  {
    path: 'results/:tab/:input/:page',
    component: ResultsComponent
  },
  {
    path: 'single',
    component: SingleComponent
  },
  {
    path: 'single/:id',
    component: SingleComponent
  },
  {
    path: 'results/:name/single/:id',
    component: SingleComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
