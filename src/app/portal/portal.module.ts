//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Title, Meta } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { TypeaheadModule } from 'ngx-bootstrap/typeahead';
import { ModalModule } from 'ngx-bootstrap/modal';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { PortalRoutingModule } from './portal-routing.module';

import {
  FontAwesomeModule,
  FaIconLibrary,
} from '@fortawesome/angular-fontawesome';
import {
  faExternalLinkAlt,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';

import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatChipsModule } from '@angular/material/chips';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';

import { HomePageComponent } from './components/home-page/home-page.component';
import { SearchBarComponent } from './components/search-bar/search-bar.component';
import { ResultsComponent } from './components/results/results.component';

import { SearchService } from './services/search.service';
import { AutosuggestService } from './services/autosuggest.service';
import { AppConfigService } from '../shared/services/app-config-service.service';

import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatCardModule } from '@angular/material/card';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
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
import { MatMenuModule } from '@angular/material/menu';

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

import { ListItemComponent } from './components/search-bar/list-item/list-item.component';
import { SunburstComponent } from './components/visualisation/sunburst/sunburst.component';
import { TreemapComponent } from './components/visualisation/treemap/treemap.component';
import { HighlightSearch } from './pipes/highlight.pipe';
import { LinksPipe } from './pipes/links.pipe';

import {
  Location,
  LocationStrategy,
  PathLocationStrategy,
  ViewportScroller,
} from '@angular/common';

import { TooltipComponent } from './components/results/tooltip/tooltip.component';
import { WINDOW_PROVIDERS } from '../shared/services/window.service';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { SuggestComponent } from './components/results/suggest/suggest.component';
import { NewsComponent } from './components/news/news/news.component';
import { InfrastructuresComponent } from './components/results/infrastructures/infrastructures.component';
import { ShareComponent } from './components/single/share/share.component';
import { SingleInfrastructureComponent } from './components/single/single-infrastructure/single-infrastructure.component';
import { OrcidComponent } from './components/single/orcid/orcid.component';
import { FiltersComponent } from './components/results/filters/filters.component';
import { CounterPipe } from './pipes/counter.pipe';
import { FilterItemPipe } from './pipes/filter-item.pipe';
import { SafeUrlPipe } from './pipes/safe-url.pipe';
import { CleanCitationPipe } from './pipes/clean-citation';
import { ReplaceSpacePipe } from './pipes/replace-space';

import { FilterSumPipe } from './pipes/filter-sum.pipe';
import { ResearchInnovationSystemComponent } from './components/science-politics/research-innovation-system/research-innovation-system.component';
import { FiguresComponent } from './components/science-politics/figures/figures.component';
import { ScrollSpyDirective } from './directives/scroll-spy.directive';
import { SingleFigureComponent } from './components/science-politics/figures/single-figure/single-figure.component';
import { RelatedLinksComponent } from './components/single/related-links/related-links.component';
import { Event, Scroll, Router } from '@angular/router'; // Router required by scroll logic
import { FilterListComponent } from './components/results/active-filters/filter-list/filter-list.component';
import { ServiceInfoComponent } from './components/service-info/service-info.component';
import { PrivacyComponent } from './components/privacy/privacy.component';
import { AccessibilityComponent } from './components/accessibility/accessibility.component';

import { SharedModule } from '../shared/shared.module';
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
import { DatasetsComponent } from './components/results/datasets/datasets.component';
import { SingleDatasetComponent } from './components/single/single-dataset/single-dataset.component';
import { ExternalLinksComponent } from './components/science-politics/external-links/external-links.component';
import { BannerComponent } from './components/home-page/banner/banner.component';
import { LatestNewsComponent } from './components/news/latest-news/latest-news.component';
import { NewsResultsComponent } from './components/news/news-results/news-results.component';
import { PieComponent } from './components/visualisation/pie/pie.component';
import { ConvertToArrayPipe } from './pipes/convert-to-array.pipe';
import { FundingCallsComponent } from './components/funding-calls/funding-calls.component';
import { SingleFundingCallComponent } from './components/funding-calls/single-funding-call/single-funding-call.component';
import { FundingCallResultsComponent } from './components/funding-calls/funding-call-results/funding-call-results.component';
import { FundingCallPreviewComponent } from './components/funding-calls/funding-call-preview/funding-call-preview.component';
import { OrganizationVisualisationsComponent } from './components/single/single-organization/organization-visualisations/organization-visualisations.component';
import { OrganizationInformationComponent } from './components/single/single-organization/organization-information/organization-information.component';
import { OrganizationSubUnitsComponent } from './components/single/single-organization/organization-sub-units/organization-sub-units.component';
import { FilterEmptyFieldPipe } from './pipes/filter-empty-field.pipe';
import { HandleLinkDisplayPipe } from './pipes/handle-link-display.pipe';
import { IsUrlPipe } from './pipes/is-url.pipe';
import { PublicationLinksComponent } from './components/single/single-publication/publication-links/publication-links.component';
import { DatasetAuthorComponent } from './components/single/single-dataset/dataset-author/dataset-author.component';
import { TkiReportsComponent } from '@portal/components/science-politics/tki-reports/tki-reports.component';
import { MatTableModule } from '@angular/material/table';
import { MatSortModule } from '@angular/material/sort';
import { HandleInfrastructureLinkPipe } from './pipes/handle-infrastructure-link.pipe';

@NgModule({
    declarations: [
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
        FiltersComponent,
        CounterPipe,
        FilterItemPipe,
        FilterSumPipe,
        SafeUrlPipe,
        ResearchInnovationSystemComponent,
        FiguresComponent,
        ScrollSpyDirective,
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
        DatasetsComponent,
        SingleDatasetComponent,
        ExternalLinksComponent,
        BannerComponent,
        LatestNewsComponent,
        NewsResultsComponent,
        PieComponent,
        ConvertToArrayPipe,
        FundingCallsComponent,
        SingleFundingCallComponent,
        FundingCallResultsComponent,
        FundingCallPreviewComponent,
        HandleLinkDisplayPipe,
        IsUrlPipe,
        OrganizationVisualisationsComponent,
        OrganizationInformationComponent,
        OrganizationSubUnitsComponent,
        FilterEmptyFieldPipe,
        HandleLinkDisplayPipe,
        IsUrlPipe,
        OrganizationVisualisationsComponent,
        OrganizationInformationComponent,
        OrganizationSubUnitsComponent,
        FilterEmptyFieldPipe,
        PublicationLinksComponent,
        DatasetAuthorComponent,
        TkiReportsComponent,
        HandleInfrastructureLinkPipe,
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
        MatDatepickerModule,
        MatNativeDateModule,
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
        MatMenuModule,
        ScrollingModule,
        ClipboardModule,
        CountUpModule,
        FontAwesomeModule,
        TransferHttpCacheModule,
        ModalModule.forRoot(),
        SharedModule,
        A11yModule,
        TooltipModule.forRoot(),
        MatTableModule,
        MatSortModule,
    ],
    exports: [DatasetAuthorComponent],
    providers: [
        SearchService,
        Title,
        Meta,
        AutosuggestService,
        WINDOW_PROVIDERS,
        AppConfigService,
        Location,
        {
            provide: LocationStrategy,
            useClass: PathLocationStrategy,
        },
        {
            provide: MAT_SNACK_BAR_DEFAULT_OPTIONS,
            useValue: { duration: 3000 },
        },
    ]
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
        const currentUrl = e.routerEvent.url;
        const history = this.historyService.history;
        const resultPages = tabChangeService.resultPageList;

        // Trigger new page so first tab focuses skip links
        const prevPageLocation = history[history.length - 2];
        const currentPageLocation = currentUrl;
        if (this.newPage(prevPageLocation, currentPageLocation)) {
          this.tabChangeService.triggerNewPage();
        }

        // Check that route is in results and not in single result
        if (
          currentUrl.includes('/results') &&
          !resultPages.some((item) =>
            currentUrl.includes(`/${item.slice(0, -1)}/`)
          )
        ) {
          const targetPage = +router.parseUrl(currentUrl).queryParams.page || 1;
          // Different page or coming from different route
          if (
            this.startPage !== targetPage ||
            !history[history.length - 2]?.includes('/results')
          ) {
            viewportScroller.scrollToPosition([0, 0]);
          }
          this.startPage = targetPage;

          // Similar to /results but for /funding-calls
        } else if (currentUrl.includes('/funding-calls')) {
          const targetPage = +router.parseUrl(currentUrl).queryParams.page || 1;
          // Different page or coming from different route
          if (
            this.startPage !== targetPage ||
            !history[history.length - 2]?.includes('/funding-calls')
          ) {
            viewportScroller.scrollToPosition([0, 0]);
          }
          this.startPage = targetPage;
        } else if (currentUrl.includes('/science-research-figures')) {
          // scroll to top only in single figure view
          if (!history[history.length - 2]?.includes('figures/s')) {
            viewportScroller.scrollToPosition([0, 0]);
          }
          if (!currentUrl.includes('filter')) {
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
