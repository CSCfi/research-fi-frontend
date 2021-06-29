import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  AfterViewInit,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  ViewChild,
  ElementRef,
  ChangeDetectorRef,
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { Title } from '@angular/platform-browser';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { isPlatformBrowser } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { WINDOW } from 'src/app/shared/services/window.service';
import { ResizeService } from 'src/app/shared/services/resize.service';
import { common } from 'src/assets/static-data/meta-tags.json';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { combineLatest, merge, Subject, Subscription } from 'rxjs';
import { Aurora } from '@portal/models/aurora.model';
import { debounceTime, map, multicast, skip, take } from 'rxjs/operators';

@Component({
  selector: 'app-aurora',
  templateUrl: './aurora.component.html',
  styleUrls: ['./aurora.component.scss']
})
export class AuroraComponent implements OnInit, AfterViewInit {
    width = this.window.innerWidth;
    mobile = this.width < 992;
    @ViewChild('skipToResults') skipToResults: ElementRef;

  
    private currentLocale: string;
    private metaTags = {};
    private commonTags = common;
  
    queryParams: any;
    currentTerm: string;
  
    combinedRouteParams: Subscription;
    focusSub: Subscription;
    resizeSub: Subscription;
    routeSub: Subscription;
    queryParamSub: Subscription;
    inputSub: Subscription;
  
    isBrowser: boolean;
    dataFetched: any;

    resultData: Aurora[];
    page: number;
    loading: boolean;
    errorMessage: string;

    tabSub: Subscription;
    showSkipLinks: boolean;
  

    selectedTabData: {
      data: string;
      label: string;
      link: string;
      icon: any;
      singular: any;
    };
  
    constructor(
      public searchService: SearchService,
      private titleService: Title,
      @Inject(LOCALE_ID) protected localeId: string,
      private tabChangeService: TabChangeService,
      @Inject(PLATFORM_ID) private platformId: object,
      private route: ActivatedRoute,
      @Inject(WINDOW) private window: Window,
      private resizeService: ResizeService,
      public utilityService: UtilityService,
      private router: Router,
      private cdr: ChangeDetectorRef,
    ) {
      this.isBrowser = isPlatformBrowser(this.platformId);
      this.currentLocale =
        this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    }
  
    ngOnInit() {
      // Tab change is needed for data fetch
      this.tabChangeService.tab = 'aurora';
      this.selectedTabData = this.tabChangeService.aurora;
  
      this.combinedRouteParams = combineLatest([
        this.route.params,
        this.route.queryParams,
      ])
        .pipe(
          map((results) => ({ params: results[0], query: results[1] })),
          multicast(new Subject(), (s) =>
            merge(
              s.pipe(take(1)), // First call is instant, after that debounce
              s.pipe(skip(1), debounceTime(1))
            )
          )
        )
        .subscribe((results) => {
          const query = results.query;
          const params = results.params;
          this.page = +query.page || 1;
      })
    
      this.searchService.updateInput('');
  
      // Set title
      switch (this.localeId) {
        case 'fi': {
          this.setTitle('');
          break;
        }
        case 'en': {
          this.setTitle('');
          break;
        }
        case 'sv': {
          this.setTitle(
            ''
          );
          break;
        }
      }

      this.getData();
  
      this.utilityService.addMeta(
        // this.metaTags['title' + this.currentLocale],
        '',
        // this.metaTags['description' + this.currentLocale],
        '',
        this.commonTags['imgAlt' + this.currentLocale]
      );
  
      this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
        this.onResize(dims)
      );

      // Search input handler
    this.inputSub = this.searchService.currentInput.subscribe(
      (input) => {
        this.currentTerm = input;
      }
    );
    }
  
    ngAfterViewInit() {
      // Set focus to header
      this.tabSub = this.tabChangeService.currentFocus.subscribe((focus) => {
        if (focus) {
          this.showSkipLinks = true;
          this.skipToResults.nativeElement.focus();
        }
      });
      // Focus to skip-to results link when clicked from header skip-links
      this.tabChangeService.currentFocusTarget.subscribe((target) => {
        if (target === 'main-link') {
          this.skipToResults.nativeElement.focus();
        }
      });
      this.cdr.detectChanges();
    }
  
    changeFocusTarget(target) {
      this.tabChangeService.targetFocus(target);
    }

    // Reset focus on blur
    resetFocus() {
      this.tabChangeService.changeFocus(false);
    }


    getData(size: number = 10) {
      this.searchService
        .getAurora(size)
        .subscribe(
          (data) => {
            this.resultData = data;
            console.log(data)
            this.loading = false;
          },
          (error) => (this.errorMessage = error as any)
        );
    }
  
    public setTitle(newTitle: string) {
      this.titleService.setTitle(newTitle);
    }
  
    ngOnDestroy() {
      this.tabChangeService.targetFocus('');
      if (isPlatformBrowser(this.platformId)) {
        this.resizeSub?.unsubscribe();
      }
      this.tabChangeService.focus = undefined;
      this.routeSub?.unsubscribe;
      this.queryParamSub?.unsubscribe;
    }
  
    onResize(event) {
      this.width = event.width;
      if (this.width >= 992) {
        this.mobile = false;
      } else {
        this.mobile = true;
      }
    }
  }
  