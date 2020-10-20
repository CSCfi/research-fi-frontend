// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, Inject, ViewChild, ElementRef, AfterViewInit, ChangeDetectorRef, OnDestroy,
         LOCALE_ID, ViewChildren, QueryList } from '@angular/core';
import { faInfoCircle, faSearch, faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { DOCUMENT } from '@angular/common';
import { FormControl } from '@angular/forms';
import { debounceTime, distinctUntilChanged, map } from 'rxjs/operators';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { ResizeService } from 'src/app/services/resize.service';
import { Subscription } from 'rxjs';
import { ScrollService } from 'src/app/services/scroll.service';
import { DataService } from 'src/app/services/data.service';
import { content } from '../../../../assets/static-data/figures-content.json';
import { WINDOW } from 'src/app/services/window.service';
import { ActivatedRoute, Router } from '@angular/router';
import { HistoryService } from 'src/app/services/history.service';
import { figures, common } from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/services/utility.service';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-figures',
  templateUrl: './figures.component.html',
  styleUrls: ['./figures.component.scss']
})
export class FiguresComponent implements OnInit, AfterViewInit, OnDestroy {
  faIconCircle = faInfoCircle;
  faSearch = faSearch;
  faChartBar = faChartBar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  navItems = [
    {id: 's1', label: $localize`:@@figuresSecHeader:Tiedon lähteet ja tuottajat`, icon: this.faIconCircle, active: true},
    {id: 's2', label: $localize`:@@figuresSec1:Tutkimuksen rahoitus`, icon: this.faChartBar, active: false},
    {id: 's3', label: $localize`:@@figuresSec2:Tutkimuksen henkilövoimavarat`, icon: this.faChartBar, active: false},
    {id: 's4', label: $localize`:@@figuresSec3:Julkaisutoiminta ja tieteellinen vaikuttavuus`, icon: this.faChartBar, active: false},
  ];

  coLink = [
    {labelFi: 'Suomen Akatemia'},
    {labelFi: 'Tilastokeskus'},
    {labelFi: 'Vipunen'},
  ];

  vipunenLink = {
    Fi: 'https://vipunen.fi/',
    En: 'https://vipunen.fi/en-gb/',
    Sv: 'https://vipunen.fi/sv-fi/'
  };

  statcenterLink = {
    Fi: 'http://www.tilastokeskus.fi/',
    En: 'http://www.tilastokeskus.fi/index_en.html',
    Sv: 'http://www.tilastokeskus.fi/index_sv.html'
  };

  okmLink = {
    Fi: 'https://www.minedu.fi/',
    En: 'https://minedu.fi/en/frontpage',
    Sv: 'https://minedu.fi/sv/framsida'
  };

  akaLink = {
    Fi: 'https://www.aka.fi/',
    En: 'https://www.aka.fi/en',
    Sv: 'https://www.aka.fi/sv/'
  };

  cscLink = {
    Fi: 'https://www.csc.fi',
    En: 'https://www.csc.fi/en/home',
    Sv: 'https://www.csc.fi'
  };

  allContent = content;
  link = 'test';
  currentSection: any;
  queryField: FormControl = new FormControl();
  queryResults: any[];
  combinedData: any;
  hasResults: boolean;
  queryTerm: any;
  @ViewChild('mainContent') mainContent: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChildren('segments') segments: QueryList<ElementRef>;
  querySub: Subscription;
  resizeSub: Subscription;
  scrollSub: Subscription;
  mobile: boolean;
  showIntro: boolean;
  focusSub: any;
  currentLocale: string;

  private metaTags = figures;
  private commonTags = common;
  roadmapFilter: string;
  filtered: any[];
  filteredQuery: any[];
  queryParamSub: Subscription;
  filterHasBeenClicked: boolean;
  queryParams: any;
  currentFilter = 'all';

  constructor( @Inject(DOCUMENT) private document: any, private cdr: ChangeDetectorRef, @Inject(WINDOW) private window: Window,
               private titleService: Title, @Inject( LOCALE_ID ) protected localeId: string, private tabChangeService: TabChangeService,
               private resizeService: ResizeService, private scrollService: ScrollService, private dataService: DataService,
               private historyService: HistoryService, private utilityService: UtilityService, private route: ActivatedRoute,
               private router: Router ) {
    // Default to first segment
    this.currentSection = 's1';
    this.queryResults = [];
    this.queryTerm = '';
    this.hasResults = true;
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
   }

  public setTitle( newTitle: string) {
    this.titleService.setTitle( newTitle );
  }

  ngOnInit(): void {
    this.queryParamSub = this.route.queryParams.subscribe(params => {
      this.currentFilter = params.filter || 'all';
      this.filter(params.filter || null);
      this.queryParams = params;
      // Scroll into first segment header
      if (this.filterHasBeenClicked) {
        this.segments.first?.nativeElement.scrollIntoView();
      }
    });

    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Lukuja tieteestä ja tutkimuksesta - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Figures on science and research - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Siffror om vetenskap och forskning - Forskning.fi');
        break;
      }
    }

    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale]);


    this.resizeSub = this.resizeService.onResize$.subscribe(_ => this.onResize());
    this.scrollSub = this.scrollService.onScroll.pipe(debounceTime(300)).subscribe(e => this.onScroll(e.y));

    this.search();
  }

  search() {
    // Subscribe to input changes
    this.querySub = this.queryField.valueChanges.pipe(
      distinctUntilChanged()
      )
      .subscribe(term => {
        // Get data from assets
        const combined = [];
        // Combine all items
        this.allContent.forEach(segment => combined.push(segment.items));
        this.combinedData = combined.flat();
        this.queryTerm = term;
        this.queryResults = term.length > 0 ? this.combinedData.filter(item =>
          item['label' + this.currentLocale].toLowerCase().includes(term.toLowerCase()) ||
          item['description' + this.currentLocale].toLowerCase().includes(term.toLowerCase())) : [];
        // Set results flag, used to show right template
        this.hasResults = this.queryResults.length === 0 && term.length > 0 ? false : true;
        // Highlight side nav item
        this.currentSection = this.queryResults.length > 0 ? '' : 's1';
    });
  }

  // Roadmap filtering with cloned content. Filter both allContent and query results
  filter(filter: string) {
    const data = cloneDeep(this.allContent);

    const filtered = data.map(s => {
      s.items = s.items.filter(item => filter !== 'all' ? item[filter] : item);
      return s;
    });

    this.allContent = filter !== 'all' ? filtered : content;

    // Set link disabled if no items
    for (const navItem of this.navItems.slice(1)) {
      Object.assign(this.navItems.find(item => item.id === navItem.id),
      {disabled: this.allContent.find(item => item.id === navItem.id).items.length > 0 ? false : true});
    }
    // Set search results data
    this.queryResults = this.combinedData?.filter(item => filter !== 'all' ? item.roadmap : item);
  }

  // Navigate with params
  navigate(params) {
    this.filterHasBeenClicked = true;
    let target;
    switch (params) {
      case 'roadmap': {
        target = 'roadmap';
        break;
      }
      default: {
        target = 'all';
      }
    }
    this.router.navigate([], {queryParams: {filter: target}});
  }

  ngAfterViewInit() {
    // Counte content width and set mobile true / false
    this.mobile = this.window.innerWidth > 991 ? false : true;
    // Show side menu on desktop
    this.showIntro = this.mobile ? false : true;
    this.cdr.detectChanges();

    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'search-input') {
        this.searchInput.nativeElement.focus();
      }
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
    // Timeout to allow page to render so scroll goes to its correct position
    if (this.historyService.history.slice(-2, -1).shift()?.includes('/science-research-figures/s')) {
      setTimeout(() => {
        this.window.scrollTo(0, this.dataService.researchFigureScrollLocation);
      }, 10);
    }
  }

  ngOnDestroy() {
    this.querySub?.unsubscribe();
    this.resizeSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
    this.tabChangeService.targetFocus('');
    this.queryParamSub?.unsubscribe();
  }

  onSectionChange(sectionId: any) {
    this.currentSection = sectionId ? sectionId : 's1';
  }

  onResize() {
    this.mobile = this.window.innerWidth > 991 ? false : true;
    this.showIntro = this.mobile ? false : true;
  }

  onScroll(y: number) {
    this.dataService.updateResearchScroll(y);
  }
}
