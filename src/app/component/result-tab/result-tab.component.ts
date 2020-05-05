import { Component, OnInit, Input, ElementRef, OnDestroy, ViewChildren, QueryList, OnChanges, Inject, LOCALE_ID,
  HostListener, PLATFORM_ID, ViewEncapsulation } from '@angular/core';
import { SearchService } from '../../services/search.service';
import { TabChangeService } from '../../services/tab-change.service';
import { Subscription } from 'rxjs';
import { ResizeService } from '../../services/resize.service';
import { UrlSerializer, Router, ActivatedRoute } from '@angular/router';
import { faArrowLeft, faArrowRight, faAngleDown, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import { isPlatformBrowser } from '@angular/common';
import { zhCnLocale } from 'ngx-bootstrap';
import { WINDOW } from 'src/app/services/window.service';

@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class ResultTabComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('scroll') ref: QueryList<any>;
  @ViewChildren('tabList') tabList: QueryList<any>;
  @Input() allData: any;
  @Input() homepageStyle: {};
  @Input() isHomepage = false;

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

  faArrowLeft = faArrowLeft;
  faArrowRight = faArrowRight;
  faAngleUp = faAngleUp;
  faAngleDown = faAngleDown;
  currentTab: { data: string; labelFi: string; labelEn: string; link: string; icon: string; };
  currentIndex: any;
  scrollTo: boolean;
  previousIndexArr = [];
  previousIndex: any;
  tabWidth: any;

  nofTabs = 7;
  tabsOpen = false;
  rowsOpen = [];
  rowsClosed = [];

  constructor(private tabChangeService: TabChangeService, @Inject( LOCALE_ID ) protected localeId: string,
              private resizeService: ResizeService, private searchService: SearchService, private router: Router,
              @Inject( PLATFORM_ID ) private platformId: object, private route: ActivatedRoute, @Inject(WINDOW) private window: Window) {
                this.locale = localeId;
  }

  ngOnInit() {
    this.calcTabsAndRows(this.window.innerWidth);

    this.queryParams = this.tabChangeService.tabQueryParams;
    // Update active tab visual after change
    this.tabSub = this.tabChangeService.currentTab.subscribe(tab => {
      this.selectedTab = tab.link;

      // Get current index and push to arr
      const current = this.tabChangeService.tabData.findIndex(i => i.link === tab.link);
      this.previousIndexArr.push(current);
      // Set previous index
      this.previousIndex = this.previousIndexArr.slice(this.previousIndexArr.length - 2, this.previousIndexArr.length)[0];
    });


    // Get updates for window resize
    this.resizeSub = this.resizeService.onResize$.subscribe(size => this.onResize(size));

    // Subscribe to query params and get current tab params
    this.queryParamSub = this.searchService.currentQueryParams.subscribe(params => {
      this.queryParams[this.selectedTab] = params;
      this.tabChangeService.tabQueryParams = this.queryParams;
    });

    // Set automatic scroll to true to make current tab visible
    this.scrollTo = true;
  }

  // Set focus to results header if click or enter
  // resetFocus(status) {
  //   this.tabChangeService.changeFocus(status);
  // }

  // Update scrollWidth and offsetWidth once data is available and DOM is rendered
  // https://stackoverflow.com/questions/34947154/angular-2-viewchild-annotation-returns-undefined
  ngOnChanges() {
    if (this.allData) {
      this.ref.changes.subscribe((result) => {
        this.scroll = result.first;
        // Subscribe to current tab and get count
        this.tabChangeService.currentTab.subscribe(tab => {
          // Recalculate tabs and rows for navigations from homePage
          this.currentTab = tab;
          // Get current tabs index number and scroll to position if auto scroll isn't disabled
          if (this.scrollTo) {
            // Get current index
            this.currentIndex = this.tabChangeService.tabData.findIndex(i => i.link === tab.link);
            // Scroll children can have edge divs. In this case get children that are tabs
            const difference = this.scroll.nativeElement.children.length - this.tabChangeService.tabData.length;
            // Scroll with current index and left + width offsets
            if (this.scroll.nativeElement.children[this.currentIndex + difference]) {
              this.scrollToPosition(
                this.currentIndex,
                this.scroll.nativeElement.children[this.currentIndex + difference].offsetLeft,
                this.scroll.nativeElement.children[this.currentIndex + difference].offsetWidth);
            }
          }
        });
        // Timeout to prevent value changed exception
        setTimeout(() => {
          this.scrollWidth = this.scroll.nativeElement.scrollWidth;
          this.offsetWidth = this.scroll.nativeElement.offsetWidth;
          this.scrollEvent(null);
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

  // Navigate between tabs with left & right arrow when focus in tab bar
  navigate(event) {
    const arr = this.tabList.toArray();
    const currentPosition = arr.findIndex(i => i.nativeElement.id === this.currentTab.link);
    switch (event.keyCode) {
      // Left arrow
      case 37: {
        if (currentPosition < 5) {this.scrollLeft(); }
        if (arr[currentPosition - 1]) {
          // Get target path
          const target = arr[currentPosition - 1].nativeElement.id;
          // Get next tab link, get params according to link and navigate
          const previousTab = arr[currentPosition - 1].nativeElement.id;
          this.router.navigate(['/results/' + target], {queryParams: this.queryParams[previousTab]});
        }
        break;
      }
      // Right arrow
      case 39: {
        if (currentPosition > 1) {this.scrollRight(); }
        if (arr[currentPosition + 1]) {
          // Get target path
          const target = arr[currentPosition + 1].nativeElement.id;
          // Get next tab link, get params according to link and navigate
          const nextTab = arr[currentPosition + 1].nativeElement.id;
          this.router.navigate(['/results/' + target], {queryParams: this.queryParams[nextTab]});
        }
        break;
      }
      case 13: {
        this.tabChangeService.changeFocus(true);
      }
    }
  }

  // Scroll to tab position on page load and on click, disabled with arrow clicks.
  scrollToPosition(index, left, itemWidth) {
    // Set scroll direction by previous index position
    let direction = index > this.previousIndex ? 'right' : 'left';
    // On page load both index & previous index are same
    const onLoad = index === this.previousIndex;
    // Swipe to right on load
    if (index === this.previousIndex) {
      direction = index > 0 ? 'right' : 'left';
    }
    switch (direction) {
      case 'left': {
        this.scroll.nativeElement.scrollLeft -= itemWidth;
        break;
      }
      case 'right': {
        if (onLoad) {
          // Calculate scroll from start of row on load
          this.scroll.nativeElement.scrollLeft += (left - itemWidth);
        } else if (index > 1) {
          this.scroll.nativeElement.scrollLeft += itemWidth;
        }
        break;
      }
    }
  }

  // Disable scroll to position method
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

  toggleTabs() {
    this.tabsOpen = !this.tabsOpen;
  }

  onResize(event) {
    this.lastScrollLocation = this.scroll.nativeElement.scrollLeft;
    this.offsetWidth = this.scroll.nativeElement.offsetWidth;
    this.scrollWidth = this.scroll.nativeElement.scrollWidth;

    if (this.isHomepage) {
      this.calcTabsAndRows(event.width);
    }
  }

  calcTabsAndRows(width: number) {
    // No calculations if not on homepage
    if (!this.isHomepage) {
      this.rowsClosed = [1];
      this.nofTabs = 6;
      return;
    }
    this.nofTabs = Math.max(1, Math.floor(width / 206) - 1);
    this.rowsOpen = Array(Math.floor((8 / (this.nofTabs + 1)) - 0.001) + 1).fill(0);
    if (this.nofTabs === 1) {
      this.rowsClosed = [1, 1];
    } else {
      this.rowsClosed = [1];
    }
  }

  // Logic to find the right indices to slice the tab array
  slicedRow(i) {
    // Exceptions on first two rows with tab length 1 while closed on homepage
    const smallFirstRowClosed = +(i === 0 && this.nofTabs === 1 && !this.tabsOpen && this.isHomepage);
    const smallSecondRowClosed = +(i === 1 && this.nofTabs === 1 && !this.tabsOpen && this.isHomepage);

    // Check row and multiply by number of tabs + exception at second row's start on small widths
    const startIdx = i * (this.nofTabs + +this.tabsOpen) + smallSecondRowClosed;
    // Check row, add 1 and multiply by number of tabs, or show all instead if possible. Exception rules as described above
    const endIdx = (i + 1) * (this.nofTabs + +(this.tabsOpen || this.nofTabs === 6)) + smallSecondRowClosed + smallFirstRowClosed;
    console.log(this.tabData.slice(startIdx, endIdx))
    return this.tabData.slice(startIdx, endIdx);
  }

  // Logic to determie when to add the 'show-more/less' button
  checkLast(row, col) {
    // Show on the last position if tabs open
    if (this.tabsOpen) {
      return row * (this.nofTabs + 1) + col === 6;
    // Otherwise if large rows, show at the end
    } else if (this.rowsClosed.length === 1) {
      return col === this.nofTabs - 1;
    // Otherwise at the end of the second row
    } else {
      return row === 1;
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      if (this.scroll) {
        this.scroll.nativeElement.removeEventListener('scroll', this.scrollEvent);
      }
      this.tabSub.unsubscribe();
      this.queryParamSub.unsubscribe();
      this.resizeSub.unsubscribe();
    }
  }
}
