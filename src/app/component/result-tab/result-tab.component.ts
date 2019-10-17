import { Component, OnInit, Input, ElementRef, OnDestroy, ViewChildren, QueryList, OnChanges, Inject, LOCALE_ID } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { TabChangeService } from '../../services/tab-change.service';
import { Subscription } from 'rxjs';
import { ResizeService } from '../../services/resize.service';
import { UrlSerializer, Router } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('scroll') ref: QueryList<any>;
  @Input() allData: any;
  @Input() homepageStyle: {};

  errorMessage: any [];
  selectedTab: string;
  searchTerm: string;
  // This is used to keep track of filters in different tabs
  queryParams: any = {};
  // CountUp animation options
  myOps = {
    duration: 0.5
  };
  first = true;

  // Variables related to scrolling logic
  scroll: ElementRef;
  lastScrollLocation = 0;
  offsetWidth;
  scrollWidth;

  tabData = this.tabChangeService.tabData;

  private tabSub: Subscription;
  private queryParamSub: Subscription;
  private searchTermSub: Subscription;
  private resizeSub: Subscription;

  locale: string;

  homepageIcons: object;

  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;

  constructor(private tabChangeService: TabChangeService, @Inject( LOCALE_ID ) protected localeId: string,
              private resizeService: ResizeService, private searchService: SearchService, private router: Router) {
                this.locale = localeId;
   }

  ngOnInit() {
    this.queryParams = this.tabChangeService.tabQueryParams;
    // Update active tab visual after change
    this.tabSub = this.tabChangeService.currentTab.subscribe(tab => {
      this.selectedTab = tab.link;
    });

    // Hide icons on pages other than home
    if (this.router.url !== '/') {
      this.homepageIcons = {
        display: 'none'
      };
    }

    // Get updates for window resize
    this.resizeSub = this.resizeService.onResize$.subscribe(size => this.onResize(size));

    this.queryParamSub = this.searchService.currentQueryParams.subscribe(params => {
      this.queryParams[this.selectedTab] = params;
      this.tabChangeService.tabQueryParams = this.queryParams;
    });

    // Reset query params after search term change
    this.searchTermSub = this.searchService.currentInput.subscribe(term => {
      // Don't reset on the value returned by BehaviorSubject initial value
      // (has to be BehaviorSubject because of search bar)
      if (!this.first) {
        this.resetQueryParams();
      } else {
        this.first = false;
      }
    });

    // Add the scroll handler, passive to improve performance
    window.addEventListener('scroll', this.scrollEvent, {capture: true, passive: true});
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollEvent);
    this.tabSub.unsubscribe();
    this.queryParamSub.unsubscribe();
    this.searchTermSub.unsubscribe();
    this.resizeSub.unsubscribe();
  }

  resetQueryParams() {
    Object.values(this.tabData).forEach(tab => this.queryParams[tab.link] = {});
    this.tabChangeService.tabQueryParams = this.queryParams;
  }

  // Update scrollWidth and offsetWidth once data is available and DOM is rendered
  // https://stackoverflow.com/questions/34947154/angular-2-viewchild-annotation-returns-undefined
  ngOnChanges() {
    if (this.allData) {
      this.ref.changes.subscribe((result) => {
        this.scroll = result.first;
        // Timeout to prevent value changed exception
        setTimeout(() => {
          this.scrollWidth = this.scroll.nativeElement.scrollWidth;
          this.offsetWidth = this.scroll.nativeElement.offsetWidth;
        }, 1);
      });
    }
  }

  scrollEvent = (e: any): void => {
    if (this.scroll) {
      this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    }
  }

  scrollLeft() {
    this.scroll.nativeElement.scrollLeft -= Math.max(150, 1 + (this.scrollWidth) / 4);
  }

  scrollRight() {
    this.scroll.nativeElement.scrollLeft += Math.max(150, 1 + (this.scrollWidth) / 4);
  }

  onResize(event) {
    this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    this.offsetWidth = this.scroll.nativeElement.offsetWidth;
    this.scrollWidth = this.scroll.nativeElement.scrollWidth;
  }
}
