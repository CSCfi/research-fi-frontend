import {
  Component,
  OnInit,
  Inject,
  LOCALE_ID,
  AfterViewInit,
  ViewChild,
  ElementRef,
  OnDestroy,
  PLATFORM_ID,
  ViewEncapsulation,
  ChangeDetectorRef,
  TemplateRef
} from '@angular/core';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { DOCUMENT, isPlatformBrowser, Location, ViewportScroller, NgFor, NgIf } from '@angular/common';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { ActivatedRoute} from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { SanitizeHtmlPipe } from '../../../shared/pipes/sanitize-html.pipe';
import { DialogComponent } from '../../../shared/components/dialog/dialog.component';
import { ReviewComponent } from '../../../shared/components/review/review.component';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BannerDividerComponent } from '../../../shared/components/banner-divider/banner-divider.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-service-info',
    templateUrl: './service-info.component.html',
    styleUrls: ['./service-info.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
  imports: [
    BannerDividerComponent,
    BreadcrumbComponent,
    MatAccordion,
    NgFor,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    NgIf,
    ReviewComponent,
    DialogComponent,
    SanitizeHtmlPipe,
    SvgSpritesComponent
  ]
})
export class ServiceInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainFocus') mainFocus: ElementRef;
  @ViewChild('reviewDialog') reviewDialog: TemplateRef<any>;
  focusSub: Subscription;
  title: string;
  openedIdx: any;
  currentLocale: string;
  routeSub: Subscription;

  private metaTags = MetaTags.serviceInfo;
  private commonTags = MetaTags.common;
  content: any[];
  showDialog: boolean;

  sections = [
    { header: $localize`:@@serviceInfoHeader:Tietoa palvelusta`, items: [] },
    { header: $localize`:@@faq:Usein kysytyt kysymykset`, items: [] },
  ];

  constructor(
    private scroller: ViewportScroller,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private location: Location,
    private utilityService: UtilityService,
    private route: ActivatedRoute,
    @Inject(DOCUMENT) private document: any,
    @Inject(PLATFORM_ID) private platformId: object,
    private cdr: ChangeDetectorRef,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.routeSub = this.route.fragment.subscribe((fragment: string) => {
      this.openedIdx = fragment;
      this.scrollToId(fragment);
    });

    // Get page data. Data is passed with resolver in router
    const pageData = this.route.snapshot.data.pages;

    // Set Service info content
    this.sections[0].items = pageData.filter((el) =>
      el.id.includes('service-info')
    );

    // Set FAQ content
    this.sections[1].items = pageData.filter((el) => el.id.includes('faq'));

    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );

    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Tietoa palvelusta - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Service info - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Information om tjänsten - Forskning.fi');
        break;
      }
    }
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);

    this.title = this.getTitle();
    //this.openedIdx = this.location.path(true).split('#')[1];
  }

  setTitle(title: string) {
    this.utilityService.setTitle(title);
  }

  getTitle() {
    return this.utilityService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainFocus.nativeElement.focus();
        }
      }
    );

    // Add review toggle onclick functionality to corresponding link
    if (isPlatformBrowser(this.platformId)) {
      const reviewLink = this.document.getElementById('toggle-review');
      if (reviewLink) {
        reviewLink.setAttribute('href', 'javascript:void(0)');
        reviewLink.addEventListener('click', (evt: Event) =>
          this.toggleReview()
        );
      }
    }
  }

  scrollToId(id: string) {
    setTimeout(() => {
      this.scroller.scrollToAnchor(id);
      }, 10);
  }

  toggleReview() {
    this.showDialog = !this.showDialog;
  }

  open(id: string) {
    this.openedIdx = id;
    // Timeout because by default open() is executed before close()
    setTimeout(() => {
      this.location.replaceState(this.location.path() + '#' + id);
    }, 1);
  }

  close(id: string) {
    if (this.openedIdx === id) this.openedIdx = '';
    this.location.replaceState(this.location.path());
    this.cdr.detectChanges();
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
    this.routeSub?.unsubscribe();
  }
}
