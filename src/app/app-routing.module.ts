// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './portal/components/home-page/home-page.component';
import { ResultsComponent } from './portal/components/results/results.component';
import { SinglePublicationComponent } from './portal/components/single/single-publication/single-publication.component';
import { SingleFundingComponent } from './portal/components/single/single-funding/single-funding.component';
import { SingleOrganizationComponent } from './portal/components/single/single-organization/single-organization.component';
import { VisualisationComponent } from './portal/components/visualisation/visualisation.component';
import { NewsComponent } from './portal/components/news/news/news.component';
// tslint:disable-next-line: max-line-length
import { ResearchInnovationSystemComponent } from './portal/components/science-politics/research-innovation-system/research-innovation-system.component';
import { FiguresComponent } from './portal/components/science-politics/figures/figures.component';
import { ExternalLinksComponent } from './portal/components/science-politics/external-links/external-links.component';
import { SingleFigureComponent } from './portal/components/science-politics/figures/single-figure/single-figure.component';
import { ServiceInfoComponent } from './portal/components/service-info/service-info.component';
import { PrivacyComponent } from './portal/components/privacy/privacy.component';
import { AccessibilityComponent } from './portal/components/accessibility/accessibility.component';
import { SitemapComponent } from './portal/components/sitemap/sitemap.component';
import { SingleInfrastructureComponent } from './portal/components/single/single-infrastructure/single-infrastructure.component';
import { NotFoundComponent } from './shared/components/not-found/not-found.component';
import { PageResolverService } from './portal/resolvers/page-resolver.service';
import { ResearchInnovationSystemSectorResolver } from './portal/resolvers/research-innovation-system-sector-resolver.service';
import { ExternalLinkResolver } from './portal/resolvers/external-link-resolver.service';
import { ShortcutResolverService } from './portal/resolvers/shortcut-resolver.service';
import { SingleDatasetComponent } from './portal/components/single/single-dataset/single-dataset.component';

const routes: Routes = [
  // {
  //   path: '',
  //   pathMatch: 'full',
  //   component: HomePageComponent,
  //   resolve: {
  //     shortcuts: ShortcutResolverService,
  //   },
  // },
  {
    path: 'results/publication',
    redirectTo: 'results/publications',
    pathMatch: 'full',
  },
  {
    path: 'results/funding',
    redirectTo: 'results/fundings',
    pathMatch: 'full',
  },
  {
    path: 'results/organization',
    redirectTo: 'results/organizations',
    pathMatch: 'full',
  },
  {
    path: 'results/publication/:id',
    component: SinglePublicationComponent,
  },
  {
    path: 'results/funding/:id',
    component: SingleFundingComponent,
  },
  // {
  //   path: 'results/dataset/:id',
  //   component: SingleDatasetComponent,
  // },
  {
    path: 'results/organization/:id',
    component: SingleOrganizationComponent,
  },
  {
    path: 'results/infrastructure/:id',
    component: SingleInfrastructureComponent,
  },
  {
    path: 'results',
    redirectTo: 'results/publications',
    pathMatch: 'full',
  },
  {
    path: 'results/:tab',
    component: ResultsComponent,
  },
  {
    path: 'results/:tab/:input',
    component: ResultsComponent,
  },
  {
    path: 'results/:tab/:input/:page',
    component: ResultsComponent,
  },
  {
    path: 'visual',
    redirectTo: 'visual/publications',
    pathMatch: 'full',
  },
  {
    path: 'visual/:tab',
    component: VisualisationComponent,
  },
  {
    path: 'visual/:tab/:input',
    component: VisualisationComponent,
  },
  {
    path: 'news',
    pathMatch: 'full',
    component: NewsComponent,
  },
  {
    path: 'science-innovation-policy',
    component: ResearchInnovationSystemComponent,
    pathMatch: 'full',
  },
  {
    path: 'science-innovation-policy/research-innovation-system',
    pathMatch: 'full',
    component: ResearchInnovationSystemComponent,
    resolve: {
      pages: PageResolverService,
      sectorData: ResearchInnovationSystemSectorResolver,
    },
  },
  {
    path: 'science-innovation-policy/external-links',
    pathMatch: 'full',
    component: ExternalLinksComponent,
    resolve: {
      links: ExternalLinkResolver,
    },
  },
  {
    path: 'science-innovation-policy/science-research-figures',
    pathMatch: 'full',
    component: FiguresComponent,
  },
  {
    path: 'science-innovation-policy/science-research-figures/:id',
    component: SingleFigureComponent,
  },
  {
    path: 'service-info',
    component: ServiceInfoComponent,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'privacy/:tab',
    component: PrivacyComponent,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'accessibility',
    component: AccessibilityComponent,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'sitemap',
    component: SitemapComponent,
  },
  {
    path: '404',
    component: NotFoundComponent,
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full',
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes, { anchorScrolling: 'enabled' })],
  exports: [RouterModule],
})
export class AppRoutingModule {}
