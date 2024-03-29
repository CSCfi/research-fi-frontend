// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { HomePageComponent } from './components/home-page/home-page.component';
import { ResultsComponent } from './components/results/results.component';
import { SinglePublicationComponent } from './components/single/single-publication/single-publication.component';
import { SingleFundingComponent } from './components/single/single-funding/single-funding.component';
import { SingleOrganizationComponent } from './components/single/single-organization/single-organization.component';
import { VisualisationComponent } from './components/visualisation/visualisation.component';
import { NewsComponent } from './components/news/news/news.component';
// tslint:disable-next-line: max-line-length
import { ResearchInnovationSystemComponent } from './components/science-politics/research-innovation-system/research-innovation-system.component';
import { FiguresComponent } from './components/science-politics/figures/figures.component';
import { OpenScienceAndResearchIndicatorsComponent } from './components/science-politics/open-science-and-research-indicators/open-science-and-research-indicators.component';
import { ExternalLinksComponent } from './components/science-politics/external-links/external-links.component';
import { SingleFigureComponent } from './components/science-politics/figures/single-figure/single-figure.component';
import { ServiceInfoComponent } from './components/service-info/service-info.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { AccessibilityComponent } from './components/accessibility/accessibility.component';
import { SitemapComponent } from './components/sitemap/sitemap.component';
import { SingleInfrastructureComponent } from './components/single/single-infrastructure/single-infrastructure.component';
import { NotFoundComponent } from '../shared/components/not-found/not-found.component';
import { PageResolverService } from '../shared/resolvers/page-resolver.service';
import { ResearchInnovationSystemSectorResolver } from './resolvers/research-innovation-system-sector-resolver.service';
import { ExternalLinkResolver } from './resolvers/external-link-resolver.service';
import { ShortcutResolverService } from './resolvers/shortcut-resolver.service';
import { SingleDatasetComponent } from './components/single/single-dataset/single-dataset.component';
import { SingleFundingCallComponent } from './components/single/single-funding-call/single-funding-call.component';
import { SingleIndicatorComponent } from './components/science-politics/open-science-and-research-indicators/single-indicator/single-indicator.component';
import { SinglePersonComponent } from './components/single/single-person/single-person.component';
import { Publications2Component } from '@portal/components/results/publications2/publications2.component';
// import { TkiReportsComponent } from "@portal/components/science-politics/tki-reports/tki-reports.component";

const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: HomePageComponent,
    resolve: {
      shortcuts: ShortcutResolverService,
    },
  },
  {
    path: 'results/publication',
    redirectTo: 'results/publications',
    pathMatch: 'full',
  },
  {
    path: 'results/person',
    redirectTo: 'results/persons',
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
    path: 'results/person/:id',
    component: SinglePersonComponent,
  },
  {
    path: 'results/funding/:id',
    component: SingleFundingComponent,
  },
  {
    path: 'results/dataset/:id',
    component: SingleDatasetComponent,
  },
  {
    path: 'results/organization/:id',
    component: SingleOrganizationComponent,
  },
  {
    path: 'results/infrastructure/:id',
    component: SingleInfrastructureComponent,
  },
  {
    path: 'results/funding-call/:id',
    component: SingleFundingCallComponent,
  },
  {
    path: 'results',
    redirectTo: 'results/publications',
    pathMatch: 'full',
  },
  {
    path: 'results/publications2',
    component: Publications2Component,
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
    path: 'news/:tab',
    component: NewsComponent,
  },
  {
    path: 'funding-calls',
    redirectTo: 'results/funding-calls',
    pathMatch: 'full',
  },
  {
    path: 'funding-calls/:input',
    redirectTo: 'results/funding-calls/:input',
    pathMatch: 'full',
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
    path: 'science-innovation-policy/open-science-and-research-indicators',
    pathMatch: 'full',
    component: OpenScienceAndResearchIndicatorsComponent,
    resolve: {
      pages: PageResolverService,
    },
  },
  {
    path: 'science-innovation-policy/open-science-and-research-indicators/:id',
    component: SingleIndicatorComponent,
    resolve: {
      pages: PageResolverService,
    },
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
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class PortalRoutingModule {}
