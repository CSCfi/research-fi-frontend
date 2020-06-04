import { Component, OnInit, LOCALE_ID, Inject, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-sitemap',
  templateUrl: './sitemap.component.html',
  styleUrls: ['./sitemap.component.scss']
})
export class SitemapComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: any;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService ) {}

  ngOnInit(): void {
    switch (this.localeId) {
      case 'fi': {
        this.setTitle('Sivukartta - Tiedejatutkimus.fi');
        break;
      }
      case 'en': {
        this.setTitle('Sitemap - Research.fi');
        break;
      }
      case 'en': {
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
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
  }
}
