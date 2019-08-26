import { Component, OnInit, Input, ElementRef, OnDestroy, ViewChildren, QueryList, OnChanges } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Subscription } from 'rxjs';
import { ResizeService } from 'src/app/services/resize.service';
import { UrlSerializer, Router } from '@angular/router';


@Component({
  selector: 'app-result-tab',
  templateUrl: './result-tab.component.html',
  styleUrls: ['./result-tab.component.scss']
})
export class ResultTabComponent implements OnInit, OnDestroy, OnChanges {
  @ViewChildren('scroll') ref: QueryList<any>;
  @Input() allData: any;

  errorMessage: any [];
  selectedTab: string;
  searchTerm: string;
  // This is used to keep track of filters in different tabs
  queryParams: any = {};
  myOps = {
    duration: 0.5
  };

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

  constructor(private tabChangeService: TabChangeService,
              private resizeService: ResizeService, private searchService: SearchService, private router: Router) {
   }

  ngOnInit() {
    this.resetQueryParams();
    // Update active tab visual after change
    this.tabSub = this.tabChangeService.currentTab.subscribe(tab => {
      this.selectedTab = tab.link;
    });

    // Get updates for window resize
    this.resizeSub = this.resizeService.onResize$.subscribe(size => this.onResize(size));

    this.queryParamSub = this.searchService.currentQueryParams.subscribe(params => {
      this.queryParams[this.selectedTab] = params;
    });

    // Reset query params after search term change
    this.searchTermSub = this.searchService.currentInput.subscribe(term => this.resetQueryParams());

    // Add the scroll handler, passive to improve performance
    window.addEventListener('scroll', this.scrollEvent, {capture: true, passive: true});
  }

  ngOnDestroy() {
    window.removeEventListener('scroll', this.scrollEvent);
    this.tabSub.unsubscribe();
    this.queryParamSub.unsubscribe();
    this.searchTermSub.unsubscribe();
    // this.resizeSub.unsubscribe();
  }

  resetQueryParams() {
    Object.values(this.tabData).forEach(tab => this.queryParams[tab.link] = {});
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
