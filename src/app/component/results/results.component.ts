//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, ViewChild, ElementRef, OnInit, OnDestroy, ChangeDetectorRef, Inject, LOCALE_ID,
  PLATFORM_ID, AfterViewInit, TemplateRef } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { SearchService } from '../../services/search.service';
import { SortService } from '../../services/sort.service';
import { map, multicast, debounceTime, take, skip } from 'rxjs/operators';
import { ActivatedRoute, Router } from '@angular/router';
import { TabChangeService } from '../../services/tab-change.service';
import { ResizeService } from '../../services/resize.service';
import { FilterService } from '../../services/filters/filter.service';
import { DataService } from '../../services/data.service';
import { Subscription, combineLatest, Subject, merge } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';
import { SettingsService } from 'src/app/services/settings.service';
import { publications, fundings, infrastructures, organizations, common } from 'src/assets/static-data/meta-tags.json';
import { Visual, VisualQuery } from 'src/app/models/visualisation/visualisations.model';
import { StaticDataService } from 'src/app/services/static-data.service';
import { faDownload, faTrash, faChartBar } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-results',
  templateUrl: './results.component.html',
  styleUrls: ['./results.component.scss']
})
export class ResultsComponent implements OnInit, OnDestroy, AfterViewInit {
  public searchTerm: any;
  input: Subscription;
  tabData = this.tabChangeService.tabData;
  tab: any = [];
  selectedTabData: {data: string, label: string, link: string, icon: any, singular: any};
  public tabValues: any;
  public filterValues: any;
  public filterQueryValues: any;
  errorMessage = [];
  pageNumber = 1;
  page: any;
  expandStatus: Array<boolean> = [];
  @ViewChild('singleId') singleId: ElementRef;
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('totalHeader') totalHeader: ElementRef;
  @ViewChild('skipToResults') skipToResults: ElementRef;
  queryParams: Subscription;
  publicationFilters: {fromYear: any[], toYear: any[], year: any[], field: any[], publicationType: any[], countryCode: any[],
    lang: any[], juFo: any[], openAccess: any[], internationalCollaboration: any[], organization: any[], related: any[]};
  fundingFilters: {funder: any[], typeOfFunding: any[], scheme: any[], fundingStatus: any[], fundingAmount: any[], sector: any[],
    faField: any[]};
  infrastructureFilters: {type: any[]};
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

  pageFallback = false;

  showSkipLinks: boolean;
  currentLocale: string;

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
  modalRef: BsModalRef;
  showInfo = true;
  fundingAmount = false;

  faDownload = faDownload;
  faTrash = faTrash;
  faChartBar = faChartBar;

  betaTooltip = 'Hakutulosten visualisaatiot ovat Tiedejatutkimus.fi –palvelun käyttäjien testikäytössä. Toiminnallisuutta parannetaan saadun palautteen perusteella syksyn 2020 aikana. Lisäksi visuaaleista on tulossa ruotsin- ja englanninkieliset versiot. Hankkeiden visuaalisiin tarkasteluihin lisätään myös myöntösummien jakaumat.'

  private metaTagsList = [publications, fundings, infrastructures, organizations];
  private metaTags: {link: string};
  private commonTags = common;
  inputSub: Subscription;

  constructor( private searchService: SearchService, private route: ActivatedRoute, private titleService: Title,
               private tabChangeService: TabChangeService, private router: Router, private resizeService: ResizeService,
               private sortService: SortService, private filterService: FilterService, private cdr: ChangeDetectorRef,
               @Inject( LOCALE_ID ) protected localeId: string, @Inject(WINDOW) private window: Window,
               @Inject(PLATFORM_ID) private platformId: object, private dataService: DataService, private modalService: BsModalService,
               private utilityService: UtilityService, private settingsService: SettingsService,
               private staticDataService: StaticDataService ) {
    this.filters = Object.assign({}, this.publicationFilters, this.fundingFilters);
    this.isBrowser = isPlatformBrowser(this.platformId);
    this.total = 1;
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  openModal(template: TemplateRef<any>) {
    this.modalRef = this.modalService.show(template, Object.assign({}, {class: 'wide-modal'}));
  }

  closeModal() {
    this.modalRef.hide();
    // Logic implemented in hide sub
    // this.visIdx = '0';
    // this.modalRef = undefined;
    // this.percentage = false;
  }

  onClickedOutside($event) {
    this.showInfo = false;
  }


  ngOnInit() {
    // Subscribe to route params and query params in one subscription
    this.combinedRouteParams = combineLatest([this.route.params, this.route.queryParams])
      .pipe(map(results => ({params: results[0], query: results[1]})),
            multicast(new Subject(), s => merge(s.pipe(take(1)),        // First call is instant, after that debounce
                                                s.pipe(skip(1), debounceTime(1)))))
      .subscribe(results => {
        const query = results.query;
        const params = results.params;

        // Change query target
        this.settingsService.changeTarget(query.target ? query.target : null);
        // Get search target name for visuals
        this.searchTargetName = this.staticDataService.targets?.find(t => t.value === query.target)?.['viewValue' + this.currentLocale];

        this.searchService.pageSize = parseInt(query.size, 10) || 10;


        this.page = +query.page || 1;
        if (this.page > 1000) {
          this.pageFallback = true;
          this.getTabValues();
          return;
        }

        // Check for Angular Univeral SSR, get filters if browser
        if (isPlatformBrowser(this.platformId)) {
          this.filters = this.filterService.filterList(query);
        }

        const tabChanged = this.tab !== params.tab;

        this.searchTerm = params.input || '';
        // Send search term to sort service
        this.sortService.getTerm(this.searchTerm);

        // If there's a new search term, send it to search service
        if (this.searchTerm !== this.searchService.searchTerm) {
          this.searchService.updateInput(this.searchTerm);
        }

        // Hotfix for *ngIf depending on total and not rendering search-results so new data is not fetched on empty results
        this.total = 1;
        this.selectedTabData = this.tabData.filter(tab => tab.link === params.tab)[0];
        this.metaTags = this.metaTagsList.filter(tab => tab.link === params.tab)[0];
        // Default to publications if invalid tab
        if (!this.selectedTabData) {
          this.router.navigate(['results/publications']);
          return;
        }

        this.tab = this.selectedTabData.link;

        if (tabChanged) {
          this.tabChangeService.changeTab(this.selectedTabData);
          this.sortService.updateTab(this.selectedTabData.data);
          this.updateTitle(this.selectedTabData);
          switch (this.tab) {
            case 'publications':
              this.visualisationCategories = this.visualPublication;
              this.visualisationInfo = this.staticDataService.visualisationData.publicationTooltip;
              break;
            case 'fundings':
              this.visualisationCategories = this.visualFunding;
              this.visualisationInfo = this.staticDataService.visualisationData.fundingTooltip;
              break;
            default:
              this.visualisationCategories = [];
              break;
          }
          this.visIdx = '0';
          this.visual = this.visual && !!this.visualisationCategories.length;
        }

        this.sortService.updateSort(query.sort);
        this.searchService.updatePageNumber(this.page, this.searchService.pageSize);
        this.searchService.updateQueryParams(query);

        // Check for Angular Univeral SSR, update filters if browser
        if (isPlatformBrowser(this.platformId)) {this.filterService.updateFilters(this.filters); }

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

        // If new filter data is neeed
        if (tabChanged || this.init) {
          // Reset filter values so new tab doesn't try to use previous tab's filters.
          this.filterValues = undefined;
        }

        // Get data filter
        this.getFilterData();

        // Get visualisation data
        this.getVisualData();
        // this.getQueryFilterData();
        // Reset flags
        this.searchService.redirecting = false;
        this.init = false;
      });

    // Get tab values only on search term change
    this.inputSub = this.searchService.currentInput.subscribe(() => {
      this.getTabValues();
    });

    this.totalSub = this.searchService.currentTotal.subscribe(total => {
      this.total = total || 0;
      // Add thousand separators and set total to 0 if no hits
      this.parsedTotal = this.total ? total.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') : '0';
      this.cdr.detectChanges();
      this.dataService.updateTotalResultsValue(this.total);
      this.updateTitle(this.selectedTabData);
    });

    this.modalService.onHide.subscribe(s => {
      // this.modalRef.hide();
      this.modalRef = undefined;
      this.percentage = false;
      this.changeVisual({value: '0'});
    });

    this.visualSub = this.dataService.newFilter.subscribe(_ => this.visual = false);

    // Subscribe to resize
    this.resizeService.onResize$.subscribe(dims => this.onResize(dims.width));
    this.mobile = this.window.innerWidth < 992;
  }

  ngAfterViewInit() {
    // Set focus to header
    this.tabSub = this.tabChangeService.currentFocus.subscribe(focus => {
      if (focus) {
        this.showSkipLinks = true;
        this.skipToResults.nativeElement.focus();
      }
    });
    // Focus to skip-to results link when clicked from header skip-links
    this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.skipToResults.nativeElement.focus();
      }
    });
    this.cdr.detectChanges();
  }

  // Reset focus on blur
  resetFocus() {
    this.tabChangeService.changeFocus(false);
  }

  navigateToVisualisation() {
    // Remove empty filter properties
    const trimmedFilters = this.filters;
    Object.keys(trimmedFilters).forEach((key) => (trimmedFilters[key].length === 0) && delete trimmedFilters[key]);
    // Navigate
    this.router.navigate(['visual/', this.route.snapshot.params.tab, this.searchTerm],
    { queryParams: trimmedFilters });
  }

  getTabValues() {
    this.searchService.getTabValues()
    .pipe(map(data => [data]))
    .subscribe(tabValues => {
      this.tabValues = tabValues;
    },
    error => this.errorMessage = error as any);
  }

  getFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getFilters()
      .subscribe(filterValues => {
        this.filterValues = filterValues;
        // Send response to data service
        this.dataService.changeResponse(this.filterValues);
        // Set the title
        this.updateTitle(this.selectedTabData);
      },
        error => this.errorMessage = error as any);
    }
  }

  clearFilters() {
    this.router.navigate([], {queryParams: {target: this.settingsService.target}});
  }

  changeVisual(event: any) {
    // Update idx
    this.visIdx = event.value || this.visIdx;
    // Get data
    this.getVisualData();
  }

  getVisualData() {
    // Reset data so old data isn't used
    this.visualData = undefined;
    this.visualLoading = true;
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getVisualData(+this.visIdx, this.fundingAmount)
      .subscribe(values => {
        this.visualData = values;
        this.visualLoading = false;
      });
    }
  }

  getQueryFilterData() {
    // Check for Angular Univeral SSR, get filter data if browser
    if (isPlatformBrowser(this.platformId)) {
      this.searchService.getQueryFilters()
      .pipe(map(data => [data]))
      .subscribe(filterValues => {
        this.filterQueryValues = filterValues;
        // Send response to data service
        // this.dataService.changeResponse(this.filterValues);
        // Set the title
        this.updateTitle(this.selectedTabData);
      },
        error => this.errorMessage = error as any);
    }
  }

  updateTitle(tab: { data: string; label: string;}) {
    // Update title and <h1> with the information of the currently selected tab
    // Placeholder until real data is available
    const amount = tab.data ? this.dataService.totalResults : 999;
    // Set label by locale
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Haku - ' + tab.label + ' - Tiedejatutkimus.fi');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 2).join(' - ') + ' - ' + amount +
        (amount === 1 ? ' hakutulos' : ' hakutulosta');
        break;
      }
      case 'en': {
        this.setTitle('Search - ' + tab.label + ' - Research.fi');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 2).join(' - ') + ' - ' + amount +
        (amount === 1 ? ' result' : ' results');
        break;
      }
      case 'sv': {
        this.setTitle('Sökning - ' + tab.label + ' - Forskning.fi');
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 2).join(' - ') + ' - ' + amount +
        (amount === 1 ? ' result' : ' results');
        break;
      }
    }
    this.utilityService.addMeta(this.titleService.getTitle(),
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale])

  }

  onResize(width) {
    this.mobile = width < 992;
    this.visual = this.visual && width >= 1200;
  }

  changeFocusTarget(target) {
    this.tabChangeService.targetFocus(target);
  }

  // Unsubscribe to prevent memory leaks
  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.tabChangeService.changeTab({data: '', label: '', link: '', icon: '', singular: ''});
      this.combinedRouteParams?.unsubscribe();
      this.totalSub?.unsubscribe();
      this.tabSub?.unsubscribe();
      this.inputSub?.unsubscribe();
    }
  }

}
