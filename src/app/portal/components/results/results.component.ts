//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  ViewChild,
  ElementRef,
  OnInit,
  OnDestroy,
  ChangeDetectorRef,
  Inject,
  LOCALE_ID,
  PLATFORM_ID,
  AfterViewInit,
  TemplateRef,
  inject,
} from '@angular/core';
import { isPlatformBrowser, NgIf, NgClass, NgTemplateOutlet, NgSwitch, NgSwitchCase, NgSwitchDefault, NgFor, AsyncPipe } from '@angular/common';
import { SearchService } from '@portal/services/search.service';
import { SortService } from '@portal/services/sort.service';
import { map, debounceTime, take, skip, connect } from 'rxjs/operators';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TabChangeService } from '@portal/services/tab-change.service';
import { FilterService } from '@portal/services/filters/filter.service';
import { DataService } from '@portal/services/data.service';
import { Subscription, combineLatest, Subject, merge } from 'rxjs';
import { UtilityService } from '@shared/services/utility.service';
import { SettingsService } from '@portal/services/settings.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import {
  Visual,
  VisualQuery,
} from 'src/app/portal/models/visualisation/visualisations.model';
import { StaticDataService } from 'src/app/portal/services/static-data.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { BreakpointObserver } from '@angular/cdk/layout';
import { ClickOutsideDirective } from '../../../shared/directives/click-outside.directive';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { VisualisationComponent } from '../visualisation/visualisation.component';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { FiltersComponent } from './filters/filters.component';
import { SearchResultsComponent } from './search-results/search-results.component';
import { ActiveFiltersComponent } from './active-filters/active-filters.component';
import { FundingCallCategoryFiltersComponent } from './funding-call-category-filters/funding-call-category-filters.component';
import { SortComponent } from './sort/sort.component';
import { ResultCountComponent } from '../../../shared/components/result-count/result-count.component';
import { SecondaryButtonComponent } from '../../../shared/components/buttons/secondary-button/secondary-button.component';
import { PrimaryActionButtonComponent } from '../../../shared/components/buttons/primary-action-button/primary-action-button.component';
import { TabNavigationComponent } from '../tab-navigation/tab-navigation.component';
import { SearchBarComponent } from '../search-bar/search-bar.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-results',
    templateUrl: './results.component.html',
    styleUrls: ['./results.component.scss'],
    standalone: true,
  imports: [
    SearchBarComponent,
    TabNavigationComponent,
    NgIf,
    PrimaryActionButtonComponent,
    RouterLink,
    SecondaryButtonComponent,
    ResultCountComponent,
    NgClass,
    NgTemplateOutlet,
    SortComponent,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    FundingCallCategoryFiltersComponent,
    ActiveFiltersComponent,
    SearchResultsComponent,
    NgFor,
    FiltersComponent,
    MatFormField,
    MatLabel,
    MatSelect,
    MatOption,
    VisualisationComponent,
    DialogComponent,
    ClickOutsideDirective,
    AsyncPipe,
    SvgSpritesComponent
  ]
})
export class ResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  breakpointObserver$ = inject(BreakpointObserver);
  lessThan600$ = this.breakpointObserver$.observe('(max-width: 600px)').pipe(map(result => result.matches));

  clearAllFilters = false;

  public searchTerm: any;
  input: Subscription;
  tabData = this.tabChangeService.tabData;
  tab: any = [];
  selectedTabData: {
    data: string;
    label: string;
    link: string;
    icon: any;
    singular: any;
  };
  public tabValues: any;
  public filterValues: any;
  public filterQueryValues: any;
  errorMessage = [];
  pageNumber = 1;
  page: any;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('skipToResults') skipToResults: ElementRef;
  queryParams: Subscription;
  publicationFilters: {
    fromYear: any[];
    toYear: any[];
    year: any[];
    field: any[];
    publicationType: any[];
    countryCode: any[];
    lang: any[];
    juFo: any[];
    openAccess: any[];
    internationalCollaboration: any[];
    organization: any[];
    related: any[];
  };
  fundingFilters: {
    funder: any[];
    typeOfFunding: any[];
    scheme: any[];
    fundingStatus: any[];
    fundingAmount: any[];
    sector: any[];
    topic: any[];
  };
  infrastructureFilters: { type: any[] };
  filters: any;
  mobile: boolean;
  updateFilters: boolean;
  total: number | string;
  parsedTotal: string;
  currentQueryParams: any;
  init = true;
  isBrowser: boolean;

  totalSub: Subscription;
  combinedRouteParams: Subscription;
  tabSub: Subscription;
  focusSub: Subscription;
  tabValuesSub: Subscription;
  filtersSub: Subscription;
  getVisualDataSub: Subscription;

  pageFallback = false;

  showSkipLinks: boolean;
  currentLocale: string;
  externalFilterQuery = '';

  visualPublication = this.staticDataService.visualisationData.publication;
  visualFunding = this.staticDataService.visualisationData.funding;

  searchTargetName: string;
  visual = false;
  visIdx = '0';
  visualLoading = false;
  visualisationCategories: VisualQuery[];
  visualisationInfo: string;
  visualData: Visual;
  percentage = false;
  visualSub: Subscription;
  showInfo = false;
  fundingAmount = false;
  visualisationType = false;

  showAsVisual = $localize`:@@showAsVisual:Näytä kuvana`;
  additionalInfo = $localize`:@@additionalInfo:Lisätietoa`;
  clearActiveFilters = $localize`:@@clearActiveFilters: Tyhjennä rajaukset`;
  downloadImage = $localize`:@@downloadAsImage:Lataa kuvana`;

  // tslint:disable-next-line: max-line-length
  betaTooltip =
    // 'Hakutulosten visualisaatiot ovat Tiedejatutkimus.fi –palvelun käyttäjien testikäytössä. Toiminnallisuutta parannetaan saadun palautteen perusteella syksyn 2020 aikana. Lisäksi visuaaleista on tulossa ruotsin- ja englanninkieliset versiot. Hankkeiden visuaalisiin tarkasteluihin lisätään myös myöntösummien jakaumat.';
    $localize`:@@datasetBetaInfo:Tutkimusaineistojen kuvailutiedot ovat uusi tietokokonaisuus Tiedejatutkimus.fi -portaalissa. Tietojen lähteenä ovat Fairdata-palveluista löytyvät kuvailutiedot. Koska kyseessä on uusi kokonaisuus, toivomme palautetta tiedejatutkimus@csc.fi osoitteeseen.`;

  myDataInfoTexts = [
    $localize`:@@personsResultsInfoText_1:Suomalaiseen tutkimukseen liittyvät tutkijat ja muut tutkimuksen asiantuntijat voivat luoda oman profiilin Tiedejatutkimus.fi-palveluun ORCID-tunnuksen ja Suomi.fi-tunnistautumisen avulla, minkä jälkeen profiili näkyy ja on haettavissa Tiedejatutkimus.fi-palvelun Tutkijat-osiossa.`,
    $localize`:@@personsResultsInfoText_2:Profiiliin liitetään kotiorganisaatioista ja ORCID-palvelusta siirrettyä tietoa sekä Tiedejatutkimus.fi:hin jo aiemmin siirrettyä tietoa. `,
  ];

  showLoginInfoDialog = false;
  betaDialogTitle = $localize`:@@researchersProfile:Tutkijan tiedot`;
  mydataLoginSnackbarVisible = false;
  betaSearchBannerVisible = false;
  projectInfoBannerVisible = false;

  private metaTagsList = [
    MetaTags.publications,
    MetaTags.persons,
    MetaTags.fundings,
    MetaTags.datasets,
    MetaTags.infrastructures,
    MetaTags.organizations,
    MetaTags.fundingCalls,
    MetaTags.projects
  ];
  private metaTags: { link: string };
  private commonTags = MetaTags.common;
  inputSub: Subscription;
  mobileStatusSub: Subscription;

  showDialog: boolean;
  dialogTemplate: TemplateRef<any>;
  dialogTitle: string;
  focusMainContent: number;

  constructor(
    public searchService: SearchService,
    private route: ActivatedRoute,
    public tabChangeService: TabChangeService,
    public router: Router,
    private sortService: SortService,
    private filterService: FilterService,
    private cdr: ChangeDetectorRef,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(PLATFORM_ID) private platformId: object,
    public dataService: DataService,
    private utilityService: UtilityService,
    private settingsService: SettingsService,
    private staticDataService: StaticDataService,
    private appSettingsService: AppSettingsService,
  ) {
    this.filters = Object.assign(
      {},
      this.publicationFilters,
      this.fundingFilters
    );
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.total = 1;

    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setExternalFilters(filter: any) {
    this.externalFilterQuery = filter;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  openDialog(template: TemplateRef<any>) {
    this.showDialog = true;
    this.dialogTemplate = template;
    this.dialogTitle = this.visualisationCategories[this.visIdx].title;
  }

  closeDialog() {
    this.showDialog = false;
    this.percentage = false;
    this.fundingAmount = false;
    this.changeVisual({ value: '0' });
  }

  onClickedOutside($event) {
    this.showInfo = false;
  }

  tabName$ = this.route.params.pipe(
    map((params) => params.tab)
  );

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)){
      if (sessionStorage.getItem('researchersLoginSnackbarVisible')) {
        this.mydataLoginSnackbarVisible = true;
      }
      if (sessionStorage.getItem('betaSearchBannerVisible')) {
        this.betaSearchBannerVisible = true;
      }
      if (sessionStorage.getItem('projectInfoBannerVisible')) {
        this.projectInfoBannerVisible = true;
      }
    }

    // Subscribe to route params and query params in one subscription
    this.combinedRouteParams = combineLatest([
      this.route.params,
      this.route.queryParams,
    ])
      .pipe(
        map((results) => ({ params: results[0], query: results[1] })),
        // Take first values from route parameters.
        // Skipping next value is to prevent nulling tab based parameters on tab change
        connect(
          (source) =>
            merge(
              source.pipe(take(1)), // First call is instant, after that debounce
              source.pipe(skip(1), debounceTime(1))
            ),
          {
            connector: () => new Subject(),
          }
        )
      )
      .subscribe((results) => {
        this.doSearch(results.query, results.params);
      });

    // Get tab values only on search term change
    this.inputSub = this.searchService.currentInput.subscribe(() => {
      this.filterValues = undefined;
      this.clearAllFiltersFromActiveFilters();
      this.getTabValues();
    });

    this.totalSub = this.searchService.currentTotal.subscribe((total) => {
      this.total = total || 0;
      // Add thousand separators and set total to 0 if no hits
      this.parsedTotal = this.total
        ? total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
        : '0';
      this.cdr.detectChanges();
      this.dataService.updateTotalResultsValue(this.total);
      this.updateTitle(this.selectedTabData);
    });

    this.visualSub = this.dataService.newFilter.subscribe(
      (_) => (this.visual = false)
    );

    // Handle mobile status
    this.mobileStatusSub = this.appSettingsService.mobileStatus.subscribe(
      (status: boolean) => {
        this.visual = this.visual && !status;
        this.mobile = status;
      }
    );
  }

  doSearch(queryParams: any, targetTab: any){
    // Change query target
    this.settingsService.changeTarget(queryParams.target ? queryParams.target : null);
    // Get search target name for visuals
    this.searchTargetName = this.staticDataService.targets?.find(
      (t) => t.value === queryParams.target
    )?.['viewValue' + this.currentLocale];

    this.searchService.pageSize = parseInt(queryParams.size, 10) || 10;

    this.page = +queryParams.page || 1;
    if (this.page > 1000) {
      this.pageFallback = true;
      this.getTabValues();
      return;
    }

    // Check for Angular Univeral SSR, get filters if browser
    if (isPlatformBrowser(this.platformId)) {
      this.filters = this.filterService.filterList(queryParams);
    }

    const tabChanged = this.tab !== targetTab.tab;

    this.searchTerm = targetTab.input || '';
    // Send search term to sort service
    this.sortService.getTerm(this.searchTerm);


    // If there's a new search term, send it to search service. This does the actual search
    if (this.searchTerm !== this.searchService.searchTerm) {
      this.searchService.updateInput(this.searchTerm);
    }

    // Hotfix for *ngIf depending on total and not rendering search-results so new data is not fetched on empty results
    this.total = 1;

    this.selectedTabData = this.tabData.filter(
      (tab) => tab.link === targetTab.tab
    )[0];

    this.metaTags = this.metaTagsList.filter(
      (tab) => tab.link === targetTab.tab
    )[0];

    // Default to publications if invalid tab
    if (!this.selectedTabData) {
      this.router.navigate(['results/publications']);
      return;
    }

    this.tab = this.selectedTabData.link;
    this.tabChangeService.tabQueryParams[this.tab] = queryParams;


    if (tabChanged) {
      this.tabChangeService.changeTab(this.selectedTabData);
      this.sortService.updateTab(this.selectedTabData.data);
      this.updateTitle(this.selectedTabData);
      switch (this.tab) {
        case 'publications':
          this.visualisationCategories = this.visualPublication;
          this.visualisationInfo =
            this.staticDataService.visualisationData[
            'publicationTooltip' + this.currentLocale
              ];
          break;
        case 'fundings':
          this.visualisationCategories = this.visualFunding;
          this.visualisationInfo =
            this.staticDataService.visualisationData[
            'fundingTooltip' + this.currentLocale
              ];
          break;
        default:
          this.visualisationCategories = [];
          break;
      }
      this.visIdx = '0';
      this.visual = this.visual && !!this.visualisationCategories.length;
    }

    this.sortService.updateSort(queryParams.sort);
    this.searchService.updatePageNumber(
      this.page,
      this.searchService.pageSize
    );
    this.searchService.updateQueryParams(queryParams);

    // Check for Angular Univeral SSR, update filters if browser
    if (isPlatformBrowser(this.platformId)) {
      this.filterService.updateFilters(this.filters);
    }

    // Flag telling search-results to fetch new filtered data
    this.updateFilters = !this.updateFilters;

    // // If init without search bar redirecting, get data
    // if (this.init && !this.searchService.redirecting) {
    //   this.getTabValues();
    // // If search bar is redirecting, get data from search service. Get data "async" so result tab runs onChanges twice at startup
    // } else if (this.searchService.redirecting) {
    //   setTimeout(() => {
    //     this.tabValues = [this.searchService.tabValues];
    //   }, 1);
    // }

    // If new filter data is needed
    if (tabChanged || this.init) {
      // Reset filter values so new tab doesn't try to use previous tab's filters.
      this.filterValues = undefined;
    }

    // Get data filter
    this.getFilterData();

    // Get visualisation data
    this.getVisualData();

    // Reset flags
    this.searchService.redirecting = false;
    this.init = false;
  }

  ngAfterViewInit() {
    // Set focus to header
    this.tabSub = this.tabChangeService.focusToSkipToResultsObs.subscribe((focus) => {
      if (focus) {
        this.showSkipLinks = true;
        this.skipToResults.nativeElement.focus({
          preventScroll:true
        });
      }
    });
    // Focus to skip-to results link when clicked from header skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.skipToResults.nativeElement.focus();
        }
      }
    );
    this.cdr.detectChanges();
  }

  // Reset focus on blur
  resetFocus() {
    this.tabChangeService.focusToSkipToResults(false);
  }

  navigateToVisualisation() {
    // Remove empty filter properties
    const trimmedFilters = this.filters;
    Object.keys(trimmedFilters).forEach(
      (key) => trimmedFilters[key].length === 0 && delete trimmedFilters[key]
    );
    // Navigate
    this.router.navigate(
      ['visual/', this.route.snapshot.params.tab, this.searchTerm],
      { queryParams: trimmedFilters }
    );
  }

  getTabValues() {
    this.tabValuesSub = this.searchService
      .getTabValues()
      .pipe(map((data) => [data]))
      .subscribe({
        next: (tabValues) => {
          this.tabValues = tabValues;
        },
        error: (error) => (this.errorMessage = error as any),
      });
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.filtersSub = this.searchService.getFilters().subscribe({
        next: (filterValues) => {
          this.filterValues = filterValues;
          // Send response to data service
          this.dataService.changeResponse(this.filterValues);
          // Set the title
          this.updateTitle(this.selectedTabData);
        },
        error: (error) => (this.errorMessage = error as any),
      });
    }
  }

  clearAllFiltersFromActiveFilters() {
    this.clearAllFilters = !this.clearAllFilters;
  }

  clearFilters() {
    this.router.navigate([], {
      queryParams: { target: this.settingsService.target },
    });
  }

  changeVisual(event: any) {
    // Check if theme is changed (or doesn't exist)

    const themeChanged = this.fundingAmount !== event.fundingAmount;

    if (event.fundingAmount === undefined && this.fundingAmount === true) {
      event.fundingAmount = true;
    } else if (
      event.fundingAmount === undefined &&
      this.fundingAmount === false
    ) {
      event.fundingAmount = false;
    }

    // Update idx
    this.visIdx = event.value || this.visIdx;
    // Get data (if changed)
    if (themeChanged) {
      // Update theme
      this.fundingAmount = event.fundingAmount || false;
      this.getVisualData();
    }
  }

  getVisualData() {
    // Reset data so old data isn't used
    this.visualData = undefined;
    this.visualLoading = true;
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.getVisualDataSub = this.searchService
        .getVisualData(+this.visIdx, this.fundingAmount)
        .subscribe((values) => {
          this.visualData = values;
          this.visualLoading = false;
        });
    }
  }

  getQueryFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService
        .getQueryFilters()
        .pipe(map((data) => [data]))
        .subscribe({
          next: (filterValues) => {
            this.filterQueryValues = filterValues;
            // Send response to data service
            // this.dataService.changeResponse(this.filterValues);
            // Set the title
            this.updateTitle(this.selectedTabData);
          },
          error: (error) => (this.errorMessage = error as any),
        });
    }
  }

  updateTitle(tab: { data: string; label: string }) {
    // Update title and <h1> with the information of the currently selected tab
    // Placeholder until real data is available
    const amount = tab.data ? this.dataService.totalResults : 999;
    const title = this.utilityService.getTitle()
      ? this.utilityService.getTitle()
      : '';

    // Set label by locale
    switch (this.localeId) {
      case 'fi': {
        this.setTitle(tab.label + ' - Tiedejatutkimus.fi');
        this.srHeader.nativeElement.innerHTML =
          title.split(' - ', 2).join(' - ') +
          ' - ' +
          amount +
          (amount === 1 ? ' hakutulos' : ' hakutulosta');
        break;
      }
      case 'en': {
        this.setTitle(tab.label + ' - Research.fi');
        this.srHeader.nativeElement.innerHTML =
          title.split(' - ', 2).join(' - ') +
          ' - ' +
          amount +
          (amount === 1 ? ' result' : ' results');
        break;
      }
      case 'sv': {
        this.setTitle(tab.label + ' - Forskning.fi');
        this.srHeader.nativeElement.innerHTML =
          title.split(' - ', 2).join(' - ') +
          ' - ' +
          amount +
          (amount === 1 ? ' result' : ' results');
        break;
      }
    }
    this.utilityService.addMeta(
      title,
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );
  }

  hideMydataLoginSnackbar() {
    this.mydataLoginSnackbarVisible = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('researchersLoginSnackbarVisible');
    }
  }

  hideBetaSearchBanner() {
    this.betaSearchBannerVisible = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('betaSearchBannerVisible');
    }
  }

  hideProjectsInfoBanner() {
    this.projectInfoBannerVisible = false;
    if (isPlatformBrowser(this.platformId)) {
      sessionStorage.removeItem('projectInfoBannerVisible');
    }
  }

  changeFocusTarget(target) {
    this.tabChangeService.targetFocus(target);

    if (target === 'main') {
      this.focusMainContent = Date.now();
    }

    this.cdr.detectChanges();
  }

  // Unsubscribe to prevent memory leaks
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.tabChangeService.changeTab({
        data: '',
        label: '',
        link: '',
        icon: '',
        singular: '',
      });
      this.queryParams?.unsubscribe();
      this.input?.unsubscribe();
      this.combinedRouteParams?.unsubscribe();
      this.totalSub?.unsubscribe();
      this.tabSub?.unsubscribe();
      this.focusSub?.unsubscribe();
      this.inputSub?.unsubscribe();
      this.tabValuesSub?.unsubscribe();
      this.filtersSub?.unsubscribe();
      this.visualSub?.unsubscribe();
      this.getVisualDataSub?.unsubscribe();
      this.mobileStatusSub?.unsubscribe();
    }
  }
}
