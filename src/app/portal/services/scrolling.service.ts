import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { Event, NavigationEnd, Router } from '@angular/router';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { HistoryService } from '@portal/services/history.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { filter } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ScrollingService implements OnDestroy {
  SCROLL_TO_TOP_URLS = ['/','/accessibility', '/privacy', '/mydata/terms', '/mydata/privacy', '/service-info'];
  SCROLL_TO_TOP_URL_FRAGMENTS = ['/science-innovation-policy/science-research-figures/'];

  startPage;
  resultsPageScrollPositionY = -1;
  routeSub: Subscription;

  private isContentFetched = new BehaviorSubject(false);
  private requestScrollToTop = new BehaviorSubject(false);

  isResultPage(url: string) {
    // Check if the page is on results, and that the tabname ends with 's' (not single result)
    return (
      url?.includes('/results') &&
      url?.split('/')[2].split('?')[0].slice(-1) === 's'
    );
  }

  newPage(oldUrl: string, newUrl: string) {
    // Check if both urls are on the results page (tab change)
    if (this.isResultPage(oldUrl) && this.isResultPage(newUrl)) {
      return false;
      // Check deepest locations without query params
    } else if (
      oldUrl?.split('/').slice(-1)[0].split('?')[0] ===
      newUrl.split('/').slice(-1)[0].split('?')[0]
    ) {
      return false;
      // Same for fragments
    } else if (
      oldUrl?.split('/').slice(-1)[0].split('#')[0] ===
      newUrl.split('/').slice(-1)[0].split('#')[0]
    ) {
      return false;
      // Otherwise new page
    } else {
      return true;
    }
  }

  notifyContentFetched() {
    this.isContentFetched.next(true);
  }

  scrollToTop() {
    this.requestScrollToTop.next(true);
  }

  constructor(
    library: FaIconLibrary,
    router: Router,
    viewportScroller: ViewportScroller,
    private historyService: HistoryService,
    private tabChangeService: TabChangeService,
    @Inject(PLATFORM_ID) private platformId: object
  ) {
    this.isContentFetched.subscribe(isContentFetched => {
      if (isContentFetched && this.resultsPageScrollPositionY !== -1) {
        //resultsPageMemoryScroll();
      }
    });

    this.requestScrollToTop.subscribe(state => {
      if (state) {
        scrollToTop();
      }
    });

    this.startPage = router.parseUrl(router.url).queryParams.page || 1;

    // Scroll to top of page
    // Timeout value of 0 helps Firefox to scroll
    const scrollToTop = () => {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => viewportScroller.scrollToPosition([0, 0]), 0);
      }
    };

    // Stub for CSCTV-4122 implementation
    const resultsPageMemoryScroll = () => {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          viewportScroller.scrollToPosition([0, this.resultsPageScrollPositionY]);
          this.resultsPageScrollPositionY = -1;
        }, 0);
      }
    };

    // Scroll position logics
    this.routeSub = router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const currentUrl = e.url;
        const history = this.historyService.history;
        const resultPages = tabChangeService.tabData
          .map((tab) => tab.link)
          .filter((item) => item);

        const prevPageLocation = history[history.length - 2];
        const currentPageLocation = currentUrl;

        // Disabled legacy code to change focus to header skip links for accessibility reasons in all cases except result page tab change. Need to clarify does this work as intended.
        if (this.newPage(prevPageLocation, currentPageLocation)) {
          //this.tabChangeService.triggerNewPage();

          // Needs implementation which doesn't show skip links with mouse inputs
          //this.tabChangeService.toggleSkipToInput(false);
        } else {
          // Needs implementation which doesn't show skip links with mouse inputs
          //this.tabChangeService.focusToSkipToResults(true);
        }

        // Scroll to page top on these pages. These should be removed when CSCTTV-4122 implemented.
        if (this.SCROLL_TO_TOP_URLS.includes(currentUrl)  || this.SCROLL_TO_TOP_URL_FRAGMENTS.some((fragment) => currentUrl.includes(fragment))) {
          scrollToTop();
        }

        // Check that route is in results and not in single result
        if (
          currentUrl.includes('/results') &&
          !resultPages.some((item) =>
            currentUrl.includes(`/${item.slice(0, -1)}/`)
          )
        ) {
          const targetPage = +router.parseUrl(currentUrl).queryParams.page || 1;
          this.startPage = targetPage;

          /*  // Preserve scroll position for changed filters and query param changes. Stub for CSCTTV-4122.
                    if (this.isResultPage(prevPageLocation)){
                      this.resultsPageScrollPositionY = viewportScroller.getScrollPosition()[1];
                      setTimeout(() => {
                        viewportScroller.scrollToPosition([0, this.resultsPageScrollPositionY]);
                        this.resultsPageScrollPositionY = -1;
                      }, 10);
                    }*/

        } else {
          // Navigation is on single result page
          scrollToTop();
        }

        /*  // Preserve scroll position when arriving from single result page. Stub for CSCTTV-4122.
               else if (
                 currentUrl.includes('/results') &&
                 resultPages.some((item) =>
                   currentUrl.includes(`/${item.slice(0, -1)}/`)
                 )
               ) {
                 if (isPlatformBrowser(this.platformId)) {
                   // Navigated to single result page from results page
                   if (this.isResultPage(history[history.length - 2])) {
                     this.resultsPageScrollPositionY = viewportScroller.getScrollPosition()[1];
                     viewportScroller.scrollToPosition([0, 0]);
                   }
                 }
               }*/
      });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.isContentFetched?.unsubscribe();
  }
}
