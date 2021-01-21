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
import { TabChangeService } from '@portal.services/tab-change.service';
import { Title } from '@angular/platform-browser';
import { UtilityService } from '@portal.services/utility.service';
import { sitemap, common } from '@portal.assets/static-data/meta-tags.json';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss'],
})
export class SitemapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: any;
  currentLocale: string;

  private metaTags = sitemap;
  private commonTags = common;

  constructor(
    private titleService: Title,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    private utilityService: UtilityService
  ) {
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
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
    this.titleService.setTitle(title);
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
  }
}
