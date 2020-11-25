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
import { SinglePublicationComponent } from './component/single/single-publication/single-publication.component';
import { SingleFundingComponent } from './component/single/single-funding/single-funding.component';
import { SingleOrganizationComponent } from './component/single/single-organization/single-organization.component';
import { VisualisationComponent } from './component/visualisation/visualisation.component';
import { NewsComponent } from './component/news/news/news.component';
// tslint:disable-next-line: max-line-length
import { ResearchInnovationSystemComponent } from './component/science-politics/research-innovation-system/research-innovation-system.component';
import { FiguresComponent } from './component/science-politics/figures/figures.component';
import { SingleFigureComponent} from './component/science-politics/figures/single-figure/single-figure.component';
import { ServiceInfoComponent } from './component/service-info/service-info.component';
import { PrivacyComponent } from './component/privacy/privacy.component';
import { AccessibilityComponent } from './component/accessibility/accessibility.component';
import { SitemapComponent } from './component/sitemap/sitemap.component';
import { SingleInfrastructureComponent } from './component/single/single-infrastructure/single-infrastructure.component';
import { NotFoundComponent } from './common-components/not-found/not-found.component';
import { PageResolverService } from './resolvers/page-resolver.service';
import { ResearchInnovationSystemSectorResolver } from './resolvers/research-innovation-system-sector-resolver.service';

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
    path: 'results/infrastructure/:id',
    component: SingleInfrastructureComponent
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
    path: 'science-innovation-policy',
    component: ResearchInnovationSystemComponent,
    pathMatch: 'full'
  },
  {
    path: 'science-innovation-policy/research-innovation-system',
    pathMatch: 'full',
    component: ResearchInnovationSystemComponent,
    resolve: {
      pages: PageResolverService,
      sectorData: ResearchInnovationSystemSectorResolver,
    }
  },
  {
    path: 'science-innovation-policy/science-research-figures',
    pathMatch: 'full',
    component: FiguresComponent
  },
  {
    path: 'science-innovation-policy/science-research-figures/:id',
    component: SingleFigureComponent
  },
  {
    path: 'service-info',
    component: ServiceInfoComponent,
    resolve: {
      pages: PageResolverService
    }
  },
  {
    path: 'privacy',
    component: PrivacyComponent,
    resolve: {
      pages: PageResolverService
    }
  },
  {
    path: 'privacy/:tab',
    component: PrivacyComponent,
    resolve: {
      pages: PageResolverService
    }
  },
  {
    path: 'accessibility',
    component: AccessibilityComponent,
    resolve: {
      pages: PageResolverService
    }
  },
  {
    path: 'sitemap',
    component: SitemapComponent
  },
  {
    path: '404',
    component: NotFoundComponent
  },
  {
    path: '**',
    redirectTo: '',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes, {anchorScrolling: 'enabled'})],
  exports: [RouterModule]
})
export class AppRoutingModule { }
