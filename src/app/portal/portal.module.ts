//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Title, Meta } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';
import { CommonModule } from '@angular/common';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TypeaheadModule, ModalModule } from 'ngx-bootstrap';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PortalRoutingModule } from './portal-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faExternalLinkAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

// import { AppComponent } from '../app.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

// import { LayoutModule } from '../layout/layout';
import { HomePageComponent } from './components/home-page/home-page.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ResultsComponent } from './components/results/results.component';

import { SearchService } from './services/search.service';
import { AutosuggestService } from './services/autosuggest.service';
import { AppConfigService } from '../shared/services/app-config-service.service';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatListModule } from '@angular/material/list';
import { MatTabsModule } from '@angular/material/tabs';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialogModule } from '@angular/material/dialog';
import {
  MatSnackBarModule,
  MAT_SNACK_BAR_DEFAULT_OPTIONS,
} from '@angular/material/snack-bar';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ClipboardModule } from '@angular/cdk/clipboard';
import { A11yModule } from '@angular/cdk/a11y';

import { CountUpModule } from 'ngx-countup';

import { SinglePublicationComponent } from './components/single/single-publication/single-publication.component';
import { SingleFundingComponent } from './components/single/single-funding/single-funding.component';
import { SingleOrganizationComponent } from './components/single/single-organization/single-organization.component';

import { PublicationsComponent } from './components/results/publications/publications.component';
import { PersonsComponent } from './components/results/persons/persons.component';
import { FundingsComponent } from './components/results/fundings/fundings.component';
import { OrganizationsComponent } from './components/results/organizations/organizations.component';

import { ResultTabComponent } from './components/result-tab/result-tab.component';
import { SortComponent } from './components/results/sort/sort.component';
import { PaginationComponent } from './components/results/pagination/pagination.component';
import { BreadcrumbComponent } from './components/breadcrumb/breadcrumb.component';
import { ActiveFiltersComponent } from './components/results/active-filters/active-filters.component';
import { VisualisationComponent } from './components/visualisation/visualisation.component';
import { RelatedResultsComponent } from './components/results/related-results/related-results.component';
import {
  SearchResultsComponent,
  EmptyResultComponent,
} from './components/results/search-results/search-results.component';

// import { PortalModule } from '@angular/cdk/portal';
import { ListItemComponent } from './components/search-bar/list-item/list-item.component';
import { SunburstComponent } from './components/visualisation/sunburst/sunburst.component';
import { TreemapComponent } from './components/visualisation/treemap/treemap.component';
import { HighlightSearch } from './pipes/highlight.pipe';
import { LinksPipe } from './pipes/links.pipe';

import { LOCALE_ID } from '@angular/core';
import {
  registerLocaleData,
  Location,
  LocationStrategy,
  PathLocationStrategy,
  ViewportScroller,
} from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeFi, localeEn);

import { TooltipComponent } from './components/results/tooltip/tooltip.component';
// import { WINDOW_PROVIDERS } from './services/window.service';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { SuggestComponent } from './components/results/suggest/suggest.component';
import { NewsComponent } from './components/news/news/news.component';
import { InfrastructuresComponent } from './components/results/infrastructures/infrastructures.component';
import { ShareComponent } from './components/single/share/share.component';
import { SingleInfrastructureComponent } from './components/single/single-infrastructure/single-infrastructure.component';
import { OrcidComponent } from './components/single/orcid/orcid.component';
import { InterceptService } from '../shared/services/intercept.service';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { FiltersComponent } from './components/results/filters/filters.component';
import { CounterPipe } from './pipes/counter.pipe';
import { FilterItemPipe } from './pipes/filter-item.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { CleanCitationPipe } from './pipes/clean-citation';
import { ReplaceSpacePipe } from './pipes/replace-space';

import { ErrorHandlerService } from './services/error-handler.service';
import { FilterSumPipe } from './pipes/filter-sum.pipe';
import { ResearchInnovationSystemComponent } from './components/science-politics/research-innovation-system/research-innovation-system.component';
import { FiguresComponent } from './components/science-politics/figures/figures.component';
import { ScrollSpyDirective } from './directives/scroll-spy.directive';
import { CutContentPipe } from './pipes/cut-content.pipe';
import { SingleFigureComponent } from './components/science-politics/figures/single-figure/single-figure.component';
import { RelatedLinksComponent } from './components/single/related-links/related-links.component';
import { Event, Scroll, Router, PRIMARY_OUTLET } from '@angular/router'; // Router required by ApmService and scroll logic
import 'reflect-metadata'; // Required by ApmService
import { ApmService } from '@elastic/apm-rum-angular';
import { FilterListComponent } from './components/results/active-filters/filter-list/filter-list.component';
import { ServiceInfoComponent } from './components/service-info/service-info.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { AccessibilityComponent } from './components/accessibility/accessibility.component';
import { ClickOutsideModule } from 'ng-click-outside';

import { CommonComponentsModule } from '../shared/shared.module';
import { filter } from 'rxjs/operators';
import { NewsCardComponent } from './components/news/news-card/news-card.component';
import { SitemapComponent } from './components/sitemap/sitemap.component';
import { TabItemComponent } from './components/result-tab/tab-item/tab-item.component';
import { HistoryService } from './services/history.service';
import { TabChangeService } from './services/tab-change.service';
import { NewsPaginationComponent } from './components/news/news-pagination/news-pagination.component';
import { CarouselComponent } from './components/science-politics/figures/carousel/carousel.component';
import { ResultCountComponent } from './components/results/result-count/result-count.component';
import { BarComponent } from './components/visualisation/bar/bar.component';
import { FigureFiltersComponent } from './components/science-politics/figures/figure-filters/figure-filters.component';
import { FiguresInfoComponent } from './components/science-politics/figures/figures-info/figures-info.component';
import { SanitizeHtmlPipe } from './pipes/sanitize-html.pipe';
import { DatasetsComponent } from './components/results/datasets/datasets.component';
import { SingleDatasetComponent } from './components/single/single-dataset/single-dataset.component';
import { ExternalLinksComponent } from './components/science-politics/external-links/external-links.component';
import { BannerComponent } from './components/home-page/banner/banner.component';

@NgModule({
  declarations: [
    // AppComponent,
    HomePageComponent,
    SearchBarComponent,
    ResultsComponent,
    SinglePublicationComponent,
    PublicationsComponent,
    PersonsComponent,
    ResultTabComponent,
    SortComponent,
    PaginationComponent,
    BreadcrumbComponent,
    FundingsComponent,
    SingleFundingComponent,
    ActiveFiltersComponent,
    OrganizationsComponent,
    SingleOrganizationComponent,
    VisualisationComponent,
    RelatedResultsComponent,
    SearchResultsComponent,
    EmptyResultComponent,
    ListItemComponent,
    SunburstComponent,
    TreemapComponent,
    HighlightSearch,
    TooltipComponent,
    SuggestComponent,
    NewsComponent,
    LinksPipe,
    InfrastructuresComponent,
    ShareComponent,
    SingleInfrastructureComponent,
    OrcidComponent,
    ThousandSeparatorPipe,
    FiltersComponent,
    CounterPipe,
    FilterItemPipe,
    FilterSumPipe,
    SafeUrlPipe,
    ResearchInnovationSystemComponent,
    FiguresComponent,
    ScrollSpyDirective,
    CutContentPipe,
    CleanCitationPipe,
    ReplaceSpacePipe,
    SingleFigureComponent,
    RelatedLinksComponent,
    FilterListComponent,
    ServiceInfoComponent,
    PrivacyComponent,
    AccessibilityComponent,
    NewsCardComponent,
    SitemapComponent,
    TabItemComponent,
    NewsPaginationComponent,
    CarouselComponent,
    ResultCountComponent,
    BarComponent,
    FigureFiltersComponent,
    FiguresInfoComponent,
    SanitizeHtmlPipe,
    DatasetsComponent,
    SingleDatasetComponent,
    ExternalLinksComponent,
    BannerComponent,
  ],
  imports: [
    PortalRoutingModule,
    CommonModule,
    TypeaheadModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule,
    MatInputModule,
    MatAutocompleteModule,
    MatChipsModule,
    MatFormFieldModule,
    MatCheckboxModule,
    MatCardModule,
    MatRadioModule,
    MatSelectModule,
    MatListModule,
    MatTabsModule,
    MatProgressSpinnerModule,
    MatExpansionModule,
    MatPaginatorModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatDialogModule,
    MatSnackBarModule,
    ScrollingModule,
    ClipboardModule,
    CountUpModule,
    FontAwesomeModule,
    TransferHttpCacheModule,
    ModalModule.forRoot(),
    ClickOutsideModule,
    CommonComponentsModule,
    A11yModule,
    TooltipModule.forRoot(),
  ],
  providers: [
    SearchService,
    Title,
    Meta,
    AutosuggestService,
    // WINDOW_PROVIDERS,
    AppConfigService,
    Location,
    {
      provide: LocationStrategy,
      useClass: PathLocationStrategy,
    },
    // {
    //   provide: APP_INITIALIZER,
    //   multi: true,
    //   deps: [AppConfigService],
    //   useFactory: (appConfigService: AppConfigService) => {
    //     // Load configuration from file when application starts.
    //     return () => {
    //       return appConfigService.loadAppConfig();
    //     };
    //   },
    // },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true,
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService,
    },
    {
      provide: ApmService,
      useClass: ApmService,
      deps: [Router],
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: { duration: 3000 },
    },
  ],
  // bootstrap: [AppComponent],
  entryComponents: [
    PublicationsComponent,
    PersonsComponent,
    FundingsComponent,
    InfrastructuresComponent,
    OrganizationsComponent,
    EmptyResultComponent,
  ],
})
export class PortalModule {
  startPage;

  isResultPage(url: string) {
    // Check if the page is on results, and that the tabname ends with 's' (not single result)
    return (
      url?.includes('/results') &&
      url?.split('/')[2].split('?')[0].slice(-1) === 's'
    );
  }

  newPage(oldUrl: string, newUrl: string) {
    // Check if both urls are on the results page (tab change)
    if (this.isResultPage(oldUrl) && this.isResultPage(newUrl)) {
      return false;
      // Check deepest locations without query params
    } else if (
      oldUrl?.split('/').slice(-1)[0].split('?')[0] ===
      newUrl.split('/').slice(-1)[0].split('?')[0]
    ) {
      return false;
      // Same for fragments
    } else if (
      oldUrl?.split('/').slice(-1)[0].split('#')[0] ===
      newUrl.split('/').slice(-1)[0].split('#')[0]
    ) {
      return false;
      // Otherwise new page
    } else {
      return true;
    }
  }

  constructor(
    library: FaIconLibrary,
    router: Router,
    viewportScroller: ViewportScroller,
    private historyService: HistoryService,
    private tabChangeService: TabChangeService
  ) {
    this.startPage = router.parseUrl(router.url).queryParams.page || 1;
    // Used to prevent scroll to top when filters are selected
    router.events
      .pipe(filter((e: Event): e is Scroll => e instanceof Scroll))
      .subscribe((e) => {
        // Trigger new page so first tab focuses skip links
        const prevPageLocation = this.historyService.history[
          this.historyService.history.length - 2
        ];
        const currentPageLocation = e.routerEvent.url;
        if (this.newPage(prevPageLocation, currentPageLocation)) {
          this.tabChangeService.triggerNewPage();
        }
        if (e.routerEvent.url.includes('/results')) {
          const targetPage =
            +router.parseUrl(e.routerEvent.url).queryParams.page || 1;
          // Different page or coming from different route
          if (
            this.startPage !== targetPage ||
            !this.historyService.history[
              this.historyService.history.length - 2
            ]?.includes('/results')
          ) {
            viewportScroller.scrollToPosition([0, 0]);
          }
          this.startPage = targetPage;
        } else if (e.routerEvent.url.includes('/science-research-figures')) {
          // scroll to top only in single figure view
          if (
            !this.historyService.history[
              this.historyService.history.length - 2
            ]?.includes('figures/s')
          ) {
            viewportScroller.scrollToPosition([0, 0]);
          }
          if (!e.routerEvent.url.includes('filter')) {
            viewportScroller.scrollToPosition([0, 0]);
          }
        } else {
          viewportScroller.scrollToPosition([0, 0]);
        }
      });
    // Add global icons
    library.addIcons(faExternalLinkAlt, faInfoCircle);
  }
}
