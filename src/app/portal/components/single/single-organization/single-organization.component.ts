//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  OnInit,
  ElementRef,
  ViewChild,
  OnDestroy,
  Inject,
  LOCALE_ID,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { SingleItemService } from '@portal/services/single-item.service';
import { SearchService } from '@portal/services/search.service';
import { Title } from '@angular/platform-browser';
import { Subscription } from 'rxjs';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';
import { Search } from '@portal/models/search.model';
import {
  singleOrganization,
  common,
} from 'src/assets/static-data/meta-tags.json';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { take } from 'rxjs/operators';
import { ResizeService } from '@shared/services/resize.service';
import { WINDOW } from '@shared/services/window.service';

@Component({
  selector: 'app-single-organization',
  templateUrl: './single-organization.component.html',
  styleUrls: ['./single-organization.component.scss'],
})
export class SingleOrganizationComponent implements OnInit, OnDestroy {
  linkFields = [{ label: $localize`:@@links:Linkit`, field: 'homepage' }];

  contactFields = [
    { label: 'Postiosoite', field: 'postalAddress' },
    { label: 'Y-tunnus', field: 'businessId' },
    { label: 'TK-oppilaitostunnus', field: 'statCenterId' },
  ];

  relatedList = [
    {
      labelFi: $localize`:@@publications:Julkaisut`,
      tab: 'publications',
      disabled: false,
    },
    { labelFi: $localize`:@@authors:Tutkijat`, tab: 'persons', disabled: true },
    { labelFi: $localize`:@@datasets:Aineistot`, tab: '', disabled: true },
    {
      labelFi: $localize`:@@infrastructures:Infrastruktuurit`,
      tab: 'infrastructures',
      disabled: true,
    },
    {
      labelFi: $localize`:@@otherResearchActivity:Muu tutkimustoiminta`,
      tab: '',
      disabled: true,
    },
  ];

  // Translation links
  vipunenLink = {
    Fi: 'https://vipunen.fi/',
    En: 'https://vipunen.fi/en-gb/',
    Sv: 'https://vipunen.fi/sv-fi/',
  };

  statcenterLink = {
    Fi: 'http://www.tilastokeskus.fi/',
    En: 'http://www.tilastokeskus.fi/index_en.html',
    Sv: 'http://www.tilastokeskus.fi/index_sv.html',
  };

  fintoLink = {
    Fi: 'http://finto.fi/cn/fi/',
    En: 'http://finto.fi/cn/en/',
    Sv: 'http://finto.fi/cn/sv/',
  };

  ytjLink = {
    Fi: 'https://www.ytj.fi/',
    En: 'https://www.ytj.fi/en/index.html',
    Sv: 'https://www.ytj.fi/sv/index.html',
  };

  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;

  public singleId: any;
  private metaTags = singleOrganization;
  private commonTags = common;
  responseData: Search;
  news: any[];
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  tab = 'organizations';
  idSub: Subscription;
  currentLocale: string;
  tabData: any;
  focusSub: Subscription;
  resizeSub: Subscription;
  mobile: boolean;
  showMoreNews = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private singleService: SingleItemService,
    private searchService: SearchService,
    private titleService: Title,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(WINDOW) private window: Window,
    private tabChangeService: TabChangeService,
    public utilityService: UtilityService,
    private settingsService: SettingsService,
    private resizeService: ResizeService
  ) {
    // Capitalize first letter of locale
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe((params) => {
      this.searchService.searchTerm = params.id;
      this.getData(params.id);
      this.getNews();
      this.searchService.searchTerm = ''; // Empty search term so breadcrumb link is correct
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.mobile = dims.width < 992);
    this.mobile = this.window.innerWidth < 992;

    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.organizations;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'organizations'
    );
  }

  ngAfterViewInit() {
    // Focus with skip-links
    this.focusSub = this.tabChangeService.currentFocusTarget.subscribe(
      (target) => {
        if (target === 'main-link') {
          this.backToResultsLink.nativeElement.focus();
        }
      }
    );
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.resizeSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.singleService.getSingleOrganization(id).subscribe((responseData) => {
      this.responseData = responseData;
      if (this.responseData.organizations[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(
              this.responseData.organizations[0].name + ' - Tiedejatutkimus.fi'
            );
            break;
          }
          case 'en': {
            this.setTitle(
              this.responseData.organizations[0].name.trim() + ' - Research.fi'
            );
            break;
          }
          case 'sv': {
            this.setTitle(
              this.responseData.organizations[0].name.trim() + ' - Forskning.fi'
            );
            break;
          }
        }
        const titleString = this.titleService.getTitle();
        this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
        this.utilityService.addMeta(
          titleString,
          this.metaTags['description' + this.currentLocale],
          this.commonTags['imgAlt' + this.currentLocale]
        );
        this.shapeData();
      }
    });
  }

  shapeData() {
    const source = this.responseData.organizations[0];

    // Name translations
    source.nameTranslations = Object.values(source.nameTranslations)
      .filter((x) => UtilityService.stringHasContent(x))
      .join('; ');
  }

  getNews() {
    this.searchService
      .getNews(5)
      .pipe(take(1))
      .subscribe((res) => (this.news = res));
  }

  navigateToNews() {
    this.router.navigate(['/news/1'], {
      queryParams: { organization: this.singleId },
    });
  }
}
