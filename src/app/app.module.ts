//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER, ErrorHandler } from '@angular/core';

import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { TypeaheadModule, ModalModule } from 'ngx-bootstrap';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { FontAwesomeModule, FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

import { AppComponent } from './app.component';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { UiModule } from './ui/ui.module';
import { HomePageComponent } from './component/home-page/home-page.component';
import { SearchBarComponent } from './component/search-bar/search-bar.component';
import { ResultsComponent } from './component/results/results.component';

import { SearchService } from './services/search.service';
import { AutosuggestService} from './services/autosuggest.service';
import { AppConfigService } from './services/app-config-service.service';

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
import { MatSnackBarModule, MAT_SNACK_BAR_DEFAULT_OPTIONS } from '@angular/material/snack-bar';

import { ScrollingModule } from '@angular/cdk/scrolling';
import { ClipboardModule } from '@angular/cdk/clipboard';

import { CountUpModule } from 'countup.js-angular2';

import { SinglePublicationComponent } from './component/single/single-publication/single-publication.component';
import { SingleFundingComponent } from './component/single/single-funding/single-funding.component';
import { SingleOrganizationComponent } from './component/single/single-organization/single-organization.component';

import { PublicationsComponent } from './component/results/publications/publications.component';
import { PersonsComponent } from './component/results/persons/persons.component';
import { FundingsComponent } from './component/results/fundings/fundings.component';
import { OrganizationsComponent } from './component/results/organizations/organizations.component';

import { ResultTabComponent } from './component/result-tab/result-tab.component';
import { SortComponent } from './component/results/sort/sort.component';
import { PaginationComponent } from './component/results/pagination/pagination.component';
import { BreadcrumbComponent } from './component/breadcrumb/breadcrumb.component';
import { ActiveFiltersComponent } from './component/results/active-filters/active-filters.component';
import { VisualisationComponent } from './component/visualisation/visualisation.component';
import { RelatedResultsComponent } from './component/results/related-results/related-results.component';
import { SearchResultsComponent, EmptyResultComponent } from './component/results/search-results/search-results.component';

import { PortalModule } from '@angular/cdk/portal';
import { ListItemComponent } from './component/search-bar/list-item/list-item.component';
import { SunburstComponent } from './component/visualisation/sunburst/sunburst.component';
import { TreemapComponent } from './component/visualisation/treemap/treemap.component';
import { HighlightSearch } from './pipes/highlight.pipe';
import { LinksPipe } from './pipes/links.pipe';

import { LOCALE_ID } from '@angular/core';
import { registerLocaleData, Location, LocationStrategy, PathLocationStrategy, ViewportScroller } from '@angular/common';
import localeFi from '@angular/common/locales/fi';
import localeEn from '@angular/common/locales/en';

registerLocaleData(localeFi, localeEn);

import { TooltipComponent } from './component/results/tooltip/tooltip.component';
import { WINDOW_PROVIDERS } from './services/window.service';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { SuggestComponent } from './component/results/suggest/suggest.component';
import { NewsComponent } from './component/news/news/news.component';
import { InfrastructuresComponent } from './component/results/infrastructures/infrastructures.component';
import { ShareComponent } from './component/single/share/share.component';
import { SingleInfrastructureComponent } from './component/single/single-infrastructure/single-infrastructure.component';
import { OrcidComponent } from './component/single/orcid/orcid.component';
import { InterceptService } from './services/intercept.service';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { FiltersComponent } from './component/results/filters/filters.component';
import { CounterPipe } from './pipes/counter.pipe';
import { FilterItemPipe } from './pipes/filter-item.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { CleanCitationPipe } from './pipes/clean-citation';

import { PublicationFilters } from './component/results/filters/publications';
import { PersonFilters } from './component/results/filters/persons';
import { FundingFilters } from './component/results/filters/fundings';
import { InfrastructureFilters } from './component/results/filters/infrastructures';
import { OrganizationFilters } from './component/results/filters/organizations';
import { ErrorHandlerService } from './services/error-handler.service';
import { FilterSumPipe } from './pipes/filter-sum.pipe';
import { ResearchInnovationSystemComponent } from './component/science-politics/research-innovation-system/research-innovation-system.component';
import { FiguresComponent } from './component/science-politics/figures/figures.component';
import { ScrollSpyDirective } from './directives/scroll-spy.directive';
import { CutContentPipe } from './pipes/cut-content.pipe';
import { SingleFigureComponent } from './component/science-politics/figures/single-figure/single-figure.component';
import { RelatedLinksComponent } from './component/single/related-links/related-links.component';
import { Event, Scroll, Router, PRIMARY_OUTLET } from '@angular/router'; // Router required by ApmService and scroll logic
import 'reflect-metadata'; // Required by ApmService
import { ApmService } from '@elastic/apm-rum-angular';
import { FilterListComponent } from './component/results/active-filters/filter-list/filter-list.component';
import { ServiceInfoComponent } from './component/service-info/service-info.component';
import { PrivacyComponent } from './component/privacy/privacy.component';
import { AccessibilityComponent } from './component/accessibility/accessibility.component';
import { ClickOutsideModule } from 'ng-click-outside';

import { CommonComponentsModule} from './common-components/common-components.module';
import { filter } from 'rxjs/operators';
import { NewsCardComponent } from './component/news/news-card/news-card.component';

@NgModule({
  declarations: [
    AppComponent,
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
    SingleFigureComponent,
    RelatedLinksComponent,
    FilterListComponent,
    ServiceInfoComponent,
    PrivacyComponent,
    AccessibilityComponent,
    NewsCardComponent
  ],
  imports: [
    BrowserModule.withServerTransition({ appId: 'serverApp' }),
    BrowserAnimationsModule,
    AppRoutingModule,
    HttpClientModule,
    UiModule,
    TypeaheadModule.forRoot(),
    FormsModule,
    ReactiveFormsModule,
    MatIconModule, MatInputModule,
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
    PortalModule,
    FontAwesomeModule,
    TransferHttpCacheModule,
    ModalModule.forRoot(),
    ClickOutsideModule,
    CommonComponentsModule,
    TooltipModule.forRoot()
  ],
  providers: [
    SearchService,
    Title,
    AutosuggestService,
    WINDOW_PROVIDERS,
    AppConfigService,
    Location,
    {
      provide: LocationStrategy, useClass: PathLocationStrategy
    },
    {
      provide: APP_INITIALIZER,
      multi: true,
      deps: [AppConfigService],
      useFactory: (appConfigService: AppConfigService) => {
        // Load configuration from file when application starts.
        return () => {
          return appConfigService.loadAppConfig();
        };
      }
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: InterceptService,
      multi: true
    },
    {
      provide: ErrorHandler,
      useClass: ErrorHandlerService
    },
    PublicationFilters,
    PersonFilters,
    FundingFilters,
    InfrastructureFilters,
    OrganizationFilters,
    {
      provide: ApmService,
      useClass: ApmService,
      deps: [Router]
    },
    {
      provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
      useValue: {duration: 3000}
    },
  ],
  bootstrap: [ AppComponent ],
  entryComponents: [
    PublicationsComponent,
    PersonsComponent,
    FundingsComponent,
    InfrastructuresComponent,
    OrganizationsComponent,
    EmptyResultComponent
  ]
})

export class AppModule {

  startPage;

  constructor(library: FaIconLibrary, router: Router, viewportScroller: ViewportScroller) {
    this.startPage = router.parseUrl(router.url).queryParams.page || 1;
    // Used to prevent scroll to top when filters are selected
    router.events
    .pipe(filter((e: Event): e is Scroll => e instanceof Scroll))
    .subscribe(e => {
      if ((e.routerEvent.url.includes('/results'))) {
        const targetPage = +router.parseUrl(e.routerEvent.url).queryParams.page || 1;
        if (this.startPage !== targetPage) {
          viewportScroller.scrollToPosition([0, 0]);
        }
        this.startPage = targetPage;
      } else {
        viewportScroller.scrollToPosition([0, 0]);
      }
    });
    // Add global icons
    library.addIcons(faExternalLinkAlt, faInfoCircle);
  }
}
