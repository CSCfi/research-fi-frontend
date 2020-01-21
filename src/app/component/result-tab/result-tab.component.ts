import { Component, OnInit, Input, ElementRef, OnDestroy, ViewChildren, QueryList, OnChanges, Inject, LOCALE_ID,
  HostListener, PLATFORM_ID } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { TabChangeService } from '../../services/tab-change.service';
import { Subscription } from 'rxjs';
import { ResizeService } from '../../services/resize.service';
import { UrlSerializer, Router, ActivatedRoute } from '@angular/router';
import { faArrowLeft, faArrowRight } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser } from '@angular/common';
import { zhCnLocale } from 'ngx-bootstrap';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit, OnDestroy, OnChanges {
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
  isHomePage: boolean;
  scrollTo: boolean;
  previousIndexArr = [];
  previousIndex: any;
  tabWidth: any;

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
      this.isHomePage = this.selectedTab.length > 0 ? false : true;

      // Get current index and push to arr
      const current = this.tabChangeService.tabData.findIndex(i => i.link === tab.link);
      this.previousIndexArr.push(current);
      // Set previous index
      this.previousIndex = this.previousIndexArr.slice(this.previousIndexArr.length - 2, this.previousIndexArr.length)[0];
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

    // Set automatic scroll to true to make current tab visible
    this.scrollTo = true;
  }

  // Navigate between tabs with left & right arrow when focus in tab bar
  navigate(event) {
    const arr = this.tabList.toArray();
    const currentPosition = this.tabChangeService.tabData.findIndex(i => i.link === this.currentTab.link);
    let target = '';
    switch (event.keyCode) {
      // Left arrow
      case 37: {
        if (currentPosition < 5) {this.scrollLeft(); }
        if (arr[currentPosition - 1]) {
          target = arr[currentPosition - 1].nativeElement.pathname;
          this.router.navigate([target]);
        }
        break;
      }
      // Right arrow
      case 39: {
        if (currentPosition > 1) {this.scrollRight(); }
        if (arr[currentPosition + 1]) {
          target = arr[currentPosition + 1].nativeElement.pathname;
          this.router.navigate([target]);
        }
        break;
      }
      case 13: {
        this.tabChangeService.changeFocus(true);
      }
    }
  }

  // Set focus to results header if click or enter
  resetFocus(status) {
    this.tabChangeService.changeFocus(status);
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      this.scroll.nativeElement.removeEventListener('scroll', this.scrollEvent);
      this.tabSub.unsubscribe();
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
          // Get current tabs index number and scroll to position if auto scroll isn't disabled
          if (this.scrollTo) {
            this.currentIndex = this.tabChangeService.tabData.findIndex(i => i.link === tab.link);
            this.scrollToPosition(this.currentIndex);
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

  // Scroll to tab position on page load and on click, disabled with arrow clicks.
  scrollToPosition(index) {
    // Set scroll direction by previous index position
    let direction = index > this.previousIndex ? 'right' : 'left';
    const distanceLeft = this.previousIndex - index;
    const distanceRight = index - this.previousIndex;
    // On page load both index & previous index are same
    const onLoad = index === this.previousIndex;
    if (index === this.previousIndex) {
      direction = index > 2 ? 'right' : 'left';
    }
    switch (direction) {
      case 'left': {
        if (onLoad) {
          this.scroll.nativeElement.scrollLeft -= Math.max(150, 1 + (this.scrollWidth) / 7);
        } else if (index < 5) {
          this.scroll.nativeElement.scrollLeft -= (distanceLeft <= 2 ? 160 : 360);
        }
        break;
      }
      case 'right': {
        if (onLoad) {
          this.scroll.nativeElement.scrollLeft += Math.max(150, 1 + (this.scrollWidth) /
          (this.tabChangeService.tabData.length - (index)));
        } else if (index > 1) {
          this.scroll.nativeElement.scrollLeft += (distanceRight <= 2 ? 160 : 360);
        }
        break;
      }
    }
  }

  disableScroll(status) {
    this.scrollTo = status;
  }

  scrollLeft() {
    this.disableScroll(false);
    this.scroll.nativeElement.scrollLeft -= Math.max(150, 1 + (this.scrollWidth) / 4);
  }

  scrollRight() {
    this.disableScroll(false);
    this.scroll.nativeElement.scrollLeft += Math.max(150, 1 + (this.scrollWidth) / 4);
  }

  onResize(event) {
    this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    this.offsetWidth = this.scroll.nativeElement.offsetWidth;
    this.scrollWidth = this.scroll.nativeElement.scrollWidth;
  }
}
