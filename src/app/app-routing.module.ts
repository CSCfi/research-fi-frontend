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
import { SinglePublicationComponent } from './component/single-publication/single-publication.component';
import { SingleFundingComponent } from './component/single-funding/single-funding.component';
import { SingleOrganizationComponent } from './component/single-organization/single-organization.component';
import { VisualisationComponent } from './component/visualisation/visualisation.component';
import { NewsComponent } from './component/news/news.component';

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePageComponent
  },
  {
    path: 'results/publication',
    redirectTo: 'results/publications',
    pathMatch: 'full'
  },
  {
    path: 'results/funding',
    redirectTo: 'results/fundings',
    pathMatch: 'full'
  },
  {
    path: 'results/organization',
    redirectTo: 'results/organizations',
    pathMatch: 'full'
  },
  {
    path: 'results/publication/:id',
    component: SinglePublicationComponent
  },
  {
    path: 'results/funding/:id',
    component: SingleFundingComponent
  },
  {
    path: 'results/organization/:id',
    component: SingleOrganizationComponent
  },
  {
    path: 'results',
    redirectTo: 'results/publications',
    pathMatch: 'full'
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
    path: 'visual',
    redirectTo: 'visual/publications',
    pathMatch: 'full'
  },
  {
    path: 'visual/:tab',
    component: VisualisationComponent
  },
  {
    path: 'visual/:tab/:input',
    component: VisualisationComponent
  },
  {
    path: 'news',
    pathMatch: 'full',
    component: NewsComponent
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
