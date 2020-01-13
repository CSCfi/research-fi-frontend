import { Component, OnInit, Input, ElementRef, OnDestroy, ViewChildren, QueryList, OnChanges, Inject, LOCALE_ID,
  HostListener, PLATFORM_ID, AfterViewInit } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { TabChangeService } from '../../services/tab-change.service';
import { Subscription } from 'rxjs';
import { ResizeService } from '../../services/resize.service';
import { UrlSerializer, Router, ActivatedRoute } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser } from '@angular/common';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @ViewChildren('scroll') ref: QueryList<any>;
  @ViewChildren('tabList') tabList: QueryList<ElementRef>;
  @Input() allData: any;
  @Input() homepageStyle: {};

  errorMessage: any [];
  selectedTab: string;
  searchTerm: string;
  // This is used to keep track of filters in different tabs
  queryParams: any = {};
  // CountUp animation options
  myOps = {
    duration: 0.5,
    separator: ' '
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
  currentTab: { data: string; labelFi: string; labelEn: string; link: string; icon: string; };
  currentIndex: any;
  tabListSub: Subscription;

  constructor(private tabChangeService: TabChangeService, @Inject( LOCALE_ID ) protected localeId: string,
              private resizeService: ResizeService, private searchService: SearchService, private router: Router,
              @Inject( PLATFORM_ID ) private platformId: object, private route: ActivatedRoute) {
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
  }

  // Navigate between tabs with left & right arrow when focus in tab bar
  focusNavigate(event, i) {
    this.currentIndex = i + 1;
    const arr = this.tabList.toArray();
    let target = '';
    switch (event.keyCode) {
      // Left arrow
      case 37: {
        if (arr[i - 1]) {
          this.tabChangeService.changeFocus(false, i - 1);
          arr[i - 1].nativeElement.focus();
          target = arr[i - 1].nativeElement.pathname;
          this.router.navigate([target]);
        }
        break;
      }
      // Right arrow
      case 39: {
        if (arr[i + 1]) {
          this.tabChangeService.changeFocus(false, i + 1);
          arr[i + 1].nativeElement.focus();
          target = arr[i + 1].nativeElement.pathname;
          this.router.navigate([target]);
        }
        break;
      }
    }
  }

  ngAfterViewInit() {
    this.tabListSub = this.tabList.changes.subscribe(list => {
      this.tabSub = this.tabChangeService.currentFocus.subscribe(focus => {
        const arr = list.toArray();
        this.tabChangeService.currentIndex.subscribe(index => {
          if (!focus && index >= 0 && arr[index]) {
            arr[index].nativeElement.focus();
          }
        });
      });
    });
  }

  // Set focus to results header if click or enter
  releaseFocus() {
    this.tabChangeService.changeFocus(true, -1);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.scroll.nativeElement.removeEventListener('scroll', this.scrollEvent);
      this.tabSub.unsubscribe();
      this.tabListSub.unsubscribe();
      this.queryParamSub.unsubscribe();
      this.resizeSub.unsubscribe();
    }
  }

  // Update scrollWidth and offsetWidth once data is available and DOM is rendered
  // https://stackoverflow.com/questions/34947154/angular-2-viewchild-annotation-returns-undefined
  ngOnChanges() {
    if (this.allData) {
      this.ref.changes.subscribe((result) => {
        this.scroll = result.first;
        // Subscribe to current tab and get count
        this.tabChangeService.currentTab.subscribe(tab => {
          this.currentTab = tab;
          if (this.currentTab.data.length) {
            // Update total count of current tab
            this.searchService.updateTotal(this.allData[0].aggregations._index.buckets[this.currentTab.data].doc_count);
          }
        });
        // Timeout to prevent value changed exception
        setTimeout(() => {
          this.scrollWidth = this.scroll.nativeElement.scrollWidth;
          this.offsetWidth = this.scroll.nativeElement.offsetWidth;
          this.scroll.nativeElement.addEventListener('scroll', this.scrollEvent, {capture: true, passive: true});
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
