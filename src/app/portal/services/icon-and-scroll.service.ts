import { Inject, Injectable, OnDestroy, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Subscription } from 'rxjs';
import { FaIconLibrary } from '@fortawesome/angular-fontawesome';
import { Event, NavigationEnd, Router, Scroll } from '@angular/router';
import { isPlatformBrowser, ViewportScroller } from '@angular/common';
import { HistoryService } from '@portal/services/history.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { filter } from 'rxjs/operators';
import { faExternalLinkAlt, faInfoCircle } from '@fortawesome/free-solid-svg-icons';

@Injectable({
  providedIn: 'root'
})
export class IconAndScrollService implements OnDestroy {
  startPage;
  resultsPageScrollPositionY = -1;
  routeSub: Subscription;

  private isContentFetched = new BehaviorSubject(false);

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
        resultsPageMemoryScroll();
      }
    });

    // Add global icons
    library.addIcons(faExternalLinkAlt as any, faInfoCircle as any);

    this.startPage = router.parseUrl(router.url).queryParams.page || 1;

    // Scroll to top of page
    // Timeout value of 0 helps Firefox to scroll
    const scrollToTop = () => {
      //console.log("XXX scrollToTop");
      setTimeout(() => viewportScroller.scrollToPosition([0, 0]), 10);
    };

    const resultsPageMemoryScroll = () => {
      if (isPlatformBrowser(this.platformId)) {
        setTimeout(() => {
          viewportScroller.scrollToPosition([0, this.resultsPageScrollPositionY]);
          this.resultsPageScrollPositionY = -1;
        }, 0);
      }
    };

    // Used to prevent scroll to top when filters are selected
    this.routeSub = router.events
      .pipe(filter((e: Event): e is NavigationEnd => e instanceof NavigationEnd))
      .subscribe((e) => {
        const currentUrl = e.url;
        const history = this.historyService.history;
        const resultPages = tabChangeService.tabData
          .map((tab) => tab.link)
          .filter((item) => item);

        // Trigger new page so first tab focuses skip links
        const prevPageLocation = history[history.length - 2];
        const currentPageLocation = currentUrl;

        if (this.newPage(prevPageLocation, currentPageLocation)) {
          this.tabChangeService.triggerNewPage();
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

          // Similar to /results but for /funding-calls
        } else if (
          currentUrl.includes('/results') &&
          resultPages.some((item) =>
            currentUrl.includes(`/${item.slice(0, -1)}/`)
          )
        ) {
          if (isPlatformBrowser(this.platformId)) {
            // Navigated from results page
            if (this.isResultPage(history[history.length - 2])) {
              this.resultsPageScrollPositionY = viewportScroller.getScrollPosition()[1];
              viewportScroller.scrollToPosition([0, 0]);
            }
          }
        }
      });
  }

  ngOnDestroy(): void {
    this.routeSub?.unsubscribe();
    this.isContentFetched?.unsubscribe();
  }
}
