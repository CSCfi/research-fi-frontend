// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  ChangeDetectorRef,
  OnDestroy,
  LOCALE_ID,
  ViewChildren,
  QueryList,
  PLATFORM_ID,
} from '@angular/core';
import {
  faInfoCircle,
  faSearch,
  faChevronDown,
  faChevronUp,
} from '@fortawesome/free-solid-svg-icons';
import { faChartBar } from '@fortawesome/free-regular-svg-icons';
import { isPlatformBrowser, ViewportScroller, NgIf, NgClass, NgFor, NgTemplateOutlet } from '@angular/common';
import { UntypedFormControl, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { Subscription } from 'rxjs';
import { LegacyScrollService } from '@portal/services/legacy-scroll.service';
import { DataService } from 'src/app/portal/services/data.service';
import { WINDOW } from 'src/app/shared/services/window.service';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { HistoryService } from 'src/app/portal/services/history.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { cloneDeep } from 'lodash-es';
import { CMSContentService } from '@shared/services/cms-content.service';
import { Figure } from 'src/app/portal/models/figure/figure.model';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { CutContentPipe } from '../../../../shared/pipes/cut-content.pipe';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { ScrollSpyDirective } from '../../../directives/scroll-spy.directive';
import { FigureFiltersComponent } from './figure-filters/figure-filters.component';
import { MatProgressSpinner } from '@angular/material/progress-spinner';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { BannerDividerComponent } from '../../../../shared/components/banner-divider/banner-divider.component';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-figures',
    templateUrl: './figures.component.html',
    styleUrls: ['./figures.component.scss'],
    standalone: true,
  imports: [
    BannerDividerComponent,
    NgIf,
    NgClass,
    FontAwesomeModule,
    MatProgressSpinner,
    NgFor,
    FormsModule,
    ReactiveFormsModule,
    FigureFiltersComponent,
    ScrollSpyDirective,
    MatButton,
    NgTemplateOutlet,
    RouterLink,
    MatChip,
    CutContentPipe,
    MatIcon,
    SvgSpritesComponent
  ]
})
export class FiguresComponent implements OnInit, AfterViewInit, OnDestroy {
  faIconCircle = faInfoCircle;
  faSearch = faSearch;
  faChartBar = faChartBar;
  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  currentSection: any;
  queryField: UntypedFormControl = new UntypedFormControl();
  figureData: Figure[] = [];
  filteredData: any[];
  queryResults: any[];
  combinedData: any;
  hasResults: boolean;
  queryTerm: any;
  @ViewChild('mainContent') mainContent: ElementRef;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('searchInput') searchInput: ElementRef;
  @ViewChildren('segments') segments: QueryList<ElementRef>;
  @ViewChildren('sections') sections: QueryList<ElementRef>;
  querySub: Subscription;
  resizeSub: Subscription;
  scrollSub: Subscription;
  mobile: boolean;
  showIntro: boolean;
  focusSub: any;
  currentLocale: string;
  private metaTags = MetaTags.figures;
  private commonTags = MetaTags.common;
  roadmapFilter: string;
  filtered: any[];
  filteredQuery: any[];
  routeSub: Subscription;
  queryParamSub: Subscription;
  filterHasBeenClicked: boolean;
  queryParams: any;
  currentFilter = null;
  loading = true;
  content: any[];
  contentSub: Subscription;
  figuresSub: Subscription;

  constructor(
    private cdr: ChangeDetectorRef,
    @Inject(WINDOW) private window: Window,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private resizeService: ResizeService,
    private scrollService: LegacyScrollService,
    private dataService: DataService,
    private historyService: HistoryService,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    private router: Router,
    private cmsContentService: CMSContentService,
    @Inject(PLATFORM_ID) private platformId: object,
    private appSettingsService: AppSettingsService,
    private scroller: ViewportScroller,
  ) {
    // Default to first segment
    this.currentSection = 's0';
    this.queryResults = [];
    this.queryTerm = '';
    this.hasResults = true;
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit(): void {
    if (isPlatformBrowser(this.platformId)) {
      // Get first segment content from content data service
      this.contentSub = this.cmsContentService.pageData.subscribe((data) => {
        this.content = data.find((el) => el.id === 'figures-intro');
        this.loading = false;
      });

      // Get data from API and set into sessionStorage to be reusable in single figure view.
      if (!sessionStorage.getItem('figureData')) {
        this.figuresSub = this.cmsContentService
          .getFigures()
          .subscribe((data) => {
            this.figureData = data;
            sessionStorage.setItem('figureData', JSON.stringify(data));
          });
      } else {
        this.figureData = JSON.parse(sessionStorage.getItem('figureData'));
      }
    }

    this.routeSub = this.route.fragment.subscribe((fragment: string) => {
      this.scrollToId(fragment);
    });

    this.queryParamSub = this.route.queryParams.subscribe((params) => {
      this.currentFilter = params.filter || null;
      this.filter(this.currentFilter);
      this.queryParams = params;
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

    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );

    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
    this.scrollSub = this.scrollService.onScroll
      .pipe(debounceTime(300))
      .subscribe((e) => this.onScroll(e.y));

    this.search();
  }

  search() {
    // Subscribe to input changes
    this.querySub = this.queryField.valueChanges
      .pipe(distinctUntilChanged())
      .subscribe((term) => {
        // Get data from assets
        const combined = [];
        // Combine all items
        this.figureData.forEach((segment) => combined.push(segment.figures));
        this.combinedData = combined.flat();
        this.queryTerm = term;
        this.queryResults =
          term.length > 0
            ? this.combinedData.filter(
                (item) =>
                  item['title' + this.currentLocale]
                    .toLowerCase()
                    .includes(term.toLowerCase()) ||
                  item['description' + this.currentLocale]
                    .toLowerCase()
                    .includes(term.toLowerCase())
              )
            : [];
        // Set results flag, used to show right template
        this.hasResults =
          this.queryResults.length === 0 && term.length > 0 ? false : true;
        // Highlight side nav item
        this.currentSection = this.queryResults.length > 0 ? '' : 's0';
      });
  }

  // Filtering with cloned content. Filter both figureData and query results
  filter(filter: string) {
    const data = cloneDeep(this.figureData);
    filter = filter === 'all' ? null : filter;

    const filtered = data.map((s) => {
      s.figures = s.figures.filter((item) => (filter ? item[filter] : item));
      return s;
    });

    this.filteredData = filter ? filtered : this.figureData;

    // Set link disabled if no items
    for (const navItem of this.figureData) {
      Object.assign(
        this.figureData.find((item) => item.id === navItem.id),
        {
          disabled:
            this.filteredData.find((item) => item.id === navItem.id).figures
              .length > 0
              ? false
              : true,
        }
      );
    }

    // Set search results data
    this.queryResults = this.combinedData?.filter((item) =>
      filter ? item.roadmap : item
    );
  }

  scrollTo(event: any) {
    this.segments.first?.nativeElement.scrollIntoView();
  }

  ngAfterViewInit() {
    // Count content width and set mobile true / false
    this.mobile = this.window.innerWidth > 991 ? false : true;
    // Show side menu on desktop
    this.showIntro = this.mobile ? false : true;
    this.cdr.detectChanges();

    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'search-input') {
          this.searchInput.nativeElement.focus();
        }
        if (target === 'main-link') {
          this.mainFocus.nativeElement.focus();
        }
      }
    );
  }

  ngOnDestroy() {
    this.contentSub?.unsubscribe();
    this.figuresSub?.unsubscribe();
    this.querySub?.unsubscribe();
    this.resizeSub?.unsubscribe();
    this.scrollSub?.unsubscribe();
    this.tabChangeService.targetFocus('');
    this.queryParamSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }

  onSectionChange(sectionId: string) {
    this.currentSection = sectionId ? sectionId : 's0';
  }

  onResize(dims: any) {
    this.mobile = dims.width > 991 ? false : true;
    this.showIntro = this.mobile ? false : true;
  }

  onScroll(y: number) {
    this.dataService.updateResearchScroll(y);
  }

  // Navigate to section from sidebar.
  // Reset fragment before navigation.
  // This enables side navigation linking to previously navigated item
  navigateToSection(sectionId: string) {
    this.router
      .navigate([], { fragment: null, queryParams: this.queryParams })
      .then(() =>
        this.router.navigate([], {
          fragment: sectionId,
          queryParams: this.queryParams,
        })
      );
  }

  scrollToId(id: string) {
    setTimeout(() => {
      this.scroller.scrollToAnchor(id);
    }, 10);
  }
}
