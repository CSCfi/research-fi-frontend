import {
  Component,
  OnInit,
  LOCALE_ID,
  Inject,
  ViewChild,
  ElementRef,
  AfterViewInit,
  OnDestroy,
} from '@angular/core';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { RouterLink } from '@angular/router';
import { BreadcrumbComponent } from '../breadcrumb/breadcrumb.component';
import { BannerDividerComponent } from '../../../shared/components/banner-divider/banner-divider.component';

@Component({
    selector: 'app-sitemap',
    templateUrl: './sitemap.component.html',
    styleUrls: ['./sitemap.component.scss'],
    standalone: true,
    imports: [
        BannerDividerComponent,
        BreadcrumbComponent,
        RouterLink,
    ],
})
export class SitemapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: Subscription;
  currentLocale: string;

  private metaTags = MetaTags.sitemap;
  private commonTags = MetaTags.common;

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private utilityService: UtilityService,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.utilityService.addMeta(
      this.metaTags['title' + this.currentLocale],
      this.metaTags['description' + this.currentLocale],
      this.commonTags['imgAlt' + this.currentLocale]
    );

    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Sivukartta - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Sitemap - Research.fi');
        break;
      }
      case 'sv': {
        this.setTitle('Sidkarta | Forskning.fi');
        break;
      }
    }
    // Hide skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(false);
  }

  setTitle(title: string) {
    this.utilityService.setTitle(title);
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.mainFocus.nativeElement.focus();
        }
      }
    );
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
    this.focusSub?.unsubscribe();
  }
}
