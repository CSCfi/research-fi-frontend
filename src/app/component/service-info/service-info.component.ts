import { Component, OnInit, Inject, LOCALE_ID, AfterViewInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';
import { faInfo } from '@fortawesome/free-solid-svg-icons';
import { Title } from '@angular/platform-browser';
import { contents } from '../../../assets/static-data/service-info.json';
import { TabChangeService } from 'src/app/services/tab-change.service';
import { Location } from '@angular/common';
import { UtilityService } from 'src/app/services/utility.service';
import { serviceInfo, common } from 'src/assets/static-data/meta-tags.json';

@Component({
  selector: 'app-service-info',
  templateUrl: './service-info.component.html',
  styleUrls: ['./service-info.component.scss']
})
export class ServiceInfoComponent implements OnInit, AfterViewInit, OnDestroy {
  faInfo = faInfo;

  contents = contents;
  @ViewChild('mainFocus') mainFocus: ElementRef;
  focusSub: any;
  title: string;
  openedIdx = -1;
  currentLocale: string;

  private metaTags = serviceInfo;
  private commonTags = common;

  constructor(private titleService: Title, @Inject(LOCALE_ID) protected localeId: string, private tabChangeService: TabChangeService,
              private location: Location, private utilityService: UtilityService) {
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit(): void {
    this.utilityService.addMeta(this.metaTags['title' + this.currentLocale],
                                this.metaTags['description' + this.currentLocale],
                                this.commonTags['imgAlt' + this.currentLocale])

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
    this.openedIdx = +this.location.path(true).split('#')[1];
  }

  setTitle(title: string) {
    this.titleService.setTitle(title);
  }

  getTitle() {
    return this.titleService.getTitle().split('-').shift().trim();
  }

  ngAfterViewInit() {
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(target => {
      if (target === 'main-link') {
        this.mainFocus.nativeElement.focus();
      }
    });
  }

  open(id: number) {
    this.openedIdx = id;
    // Timeout because by default open() is executed before close()
    setTimeout(() => {
      this.location.replaceState(this.location.path() + '#' + id);
    }, 1);
  }

  close() {
    this.openedIdx = -1;
    this.location.replaceState(this.location.path());
  }

  ngOnDestroy() {
    // Reset skip to input - skip-link
    this.tabChangeService.toggleSkipToInput(true);
    this.tabChangeService.targetFocus('');
  }

}
