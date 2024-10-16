import { Routes } from '@angular/router';
import { PageResolverService } from '@shared/resolvers/page-resolver.service';
import { HomePageComponent } from '@portal/components/home-page/home-page.component';
import { ShortcutResolverService } from '@portal/resolvers/shortcut-resolver.service';
import { SinglePublicationComponent } from '@portal/components/single/single-publication/single-publication.component';
import { SinglePersonComponent } from '@portal/components/single/single-person/single-person.component';
import { SingleFundingComponent } from '@portal/components/single/single-funding/single-funding.component';
import { SingleDatasetComponent } from '@portal/components/single/single-dataset/single-dataset.component';
import {
  SingleOrganizationComponent
} from '@portal/components/single/single-organization/single-organization.component';
import {
  SingleInfrastructureComponent
} from '@portal/components/single/single-infrastructure/single-infrastructure.component';
import {
  SingleFundingCallComponent
} from '@portal/components/single/single-funding-call/single-funding-call.component';
import { Publications2Component } from '@portal/components/results/publications2/publications2.component';
import { ResultsComponent } from '@portal/components/results/results.component';
import { VisualisationComponent } from '@portal/components/visualisation/visualisation.component';
import { NewsComponent } from '@portal/components/news/news/news.component';
import {
  ResearchInnovationSystemComponent
} from '@portal/components/science-politics/research-innovation-system/research-innovation-system.component';
import {
  ResearchInnovationSystemSectorResolver
} from '@portal/resolvers/research-innovation-system-sector-resolver.service';
import { ExternalLinksComponent } from '@portal/components/science-politics/external-links/external-links.component';
import { ExternalLinkResolver } from '@portal/resolvers/external-link-resolver.service';
import { FiguresComponent } from '@portal/components/science-politics/figures/figures.component';
import {
  SingleFigureComponent
} from '@portal/components/science-politics/figures/single-figure/single-figure.component';
import {
  OpenScienceAndResearchIndicatorsComponent
} from '@portal/components/science-politics/open-science-and-research-indicators/open-science-and-research-indicators.component';
import {
  SingleIndicatorComponent
} from '@portal/components/science-politics/open-science-and-research-indicators/single-indicator/single-indicator.component';
import { ServiceInfoComponent } from '@portal/components/service-info/service-info.component';
import { PrivacyComponent } from '@portal/components/privacy/privacy.component';
import { AccessibilityComponent } from '@portal/components/accessibility/accessibility.component';
import { SitemapComponent } from '@portal/components/sitemap/sitemap.component';
import { NotFoundComponent } from '@shared/components/not-found/not-found.component';

export const routes: Routes = [
  {
    path: 'mydata',
    loadChildren: () =>
      import('./mydata/mydata-routing.module').then((m) => m.MyDataRoutingModule),
  },
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
