//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { BrowserModule, Title } from '@angular/platform-browser';
import { NgModule, APP_INITIALIZER } from '@angular/core';

import { HttpClientModule } from '@angular/common/http';

import { TypeaheadModule, ModalModule } from 'ngx-bootstrap';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

import { AppRoutingModule } from './app-routing.module';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
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
import { ScrollingModule } from '@angular/cdk/scrolling';

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
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { TooltipComponent } from './component/results/tooltip/tooltip.component';
import { WINDOW_PROVIDERS } from './services/window.service';
import { TransferHttpCacheModule } from '@nguniversal/common';
import { SuggestComponent } from './component/results/suggest/suggest.component';
import { NewsComponent } from './component/news/news.component';
import { InfrastructuresComponent } from './component/results/infrastructures/infrastructures.component';
import { ShareComponent } from './component/single/share/share.component';
import { SingleInfrastructureComponent } from './component/single/single-infrastructure/single-infrastructure.component';
import { OrcidComponent } from './component/single/orcid/orcid.component';
import { ThousandSeparatorPipe } from './pipes/thousand-separator.pipe';
import { FiltersComponent } from './component/results/filters/filters/filters.component';
import { CounterPipe } from './pipes/counter.pipe';
import { FilterItemPipe } from './pipes/filter-item.pipe';

import { PublicationFilters } from './component/results/filters/filters/publications';
import { PersonFilters } from './component/results/filters/filters/persons';
import { FundingFilters } from './component/results/filters/filters/fundings';
import { InfrastructureFilters } from './component/results/filters/filters/infrastructures';
import { OrganizationFilters } from './component/results/filters/filters/organizations';

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
    FilterItemPipe
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
    ScrollingModule,
    CountUpModule,
    PortalModule,
    FontAwesomeModule,
    TransferHttpCacheModule,
    ModalModule.forRoot()
  ],
  providers: [ SearchService, Title, AutosuggestService, WINDOW_PROVIDERS,
  {provide: LOCALE_ID, useValue: 'fi-FI'},
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
  }, PublicationFilters, PersonFilters, FundingFilters, InfrastructureFilters, OrganizationFilters ],

  bootstrap: [ AppComponent ],
  entryComponents: [ PublicationsComponent, PersonsComponent, FundingsComponent, InfrastructuresComponent, OrganizationsComponent,
    EmptyResultComponent ]
})
export class AppModule { }

