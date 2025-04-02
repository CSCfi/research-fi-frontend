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
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SingleItemService } from '@portal/services/single-item.service';
import { SearchService } from '@portal/services/search.service';
import { forkJoin, Observable, Subscription } from 'rxjs';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';
import { Search } from '@portal/models/search.model';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { take } from 'rxjs/operators';
import { ResizeService } from '@shared/services/resize.service';
import { WINDOW } from '@shared/services/window.service';
import { CMSContentService } from '@shared/services/cms-content.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { FilterEmptyFieldPipe } from '../../../pipes/filter-empty-field.pipe';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { ShareComponent } from '../share/share.component';
import { RelatedLinksComponent } from '../related-links/related-links.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { SingleResultLinkComponent } from '../single-result-link/single-result-link.component';
import { NewsCardComponent } from '../../news/news-card/news-card.component';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { OrganizationVisualisationsComponent } from './organization-visualisations/organization-visualisations.component';
import { OrganizationSubUnitsComponent } from './organization-sub-units/organization-sub-units.component';
import { OrganizationInformationComponent } from './organization-information/organization-information.component';
import { MatTabGroup, MatTab } from '@angular/material/tabs';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { NgIf, NgFor } from '@angular/common';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-single-organization',
    templateUrl: './single-organization.component.html',
    styleUrls: ['./single-organization.component.scss'],
    standalone: true,
  imports: [
    SearchBarComponent,
    NgIf,
    RouterLink,
    BreadcrumbComponent,
    NgFor,
    MatTabGroup,
    MatTab,
    OrganizationInformationComponent,
    OrganizationSubUnitsComponent,
    OrganizationVisualisationsComponent,
    MatCard,
    MatCardTitle,
    NewsCardComponent,
    SingleResultLinkComponent,
    FontAwesomeModule,
    RelatedLinksComponent,
    ShareComponent,
    SafeUrlPipe,
    FilterEmptyFieldPipe,
    MatIcon,
    SvgSpritesComponent
  ]
})
export class SingleOrganizationComponent implements OnInit, OnDestroy {
  linkFields = [{ label: $localize`:@@links:Linkit`, field: 'homepage' }];

  contactFields = [
    { label: $localize`:@@orgAddress:Postiosoite`, field: 'postalAddress' },
    { label: $localize`:@@orgBID:Y-tunnus`, field: 'businessId' },
    {
      label: $localize`:@@orgSTID:Tilastokeskuksen oppilaitostunnus`,
      field: 'statCenterId',
    },
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
  private metaTags = MetaTags.singleOrganization;
  private commonTags = MetaTags.common;
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
  dataSub: Subscription;
  newsSub: Subscription;
  showVisual = true;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private singleService: SingleItemService,
    private searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(WINDOW) private window: Window,
    private tabChangeService: TabChangeService,
    public utilityService: UtilityService,
    private settingsService: SettingsService,
    private resizeService: ResizeService,
    private cmsContentService: CMSContentService,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe((params) => {
      this.searchService.searchTerm = params.id;
      this.getData(params.id);
      this.getNews();
      this.searchService.searchTerm = ''; // Empty search term so breadcrumb link is correct
    });
    this.resizeSub = this.resizeService.onResize$.subscribe(
      (dims) => (this.mobile = dims.width < 992)
    );
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
    this.dataSub?.unsubscribe();
    this.newsSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    // Organization may have an iFrame. This data comes from CMS.
    // CMS data is handled in browsers storage
    // Browser check for SSR build. Session Storage not available within Node.

    // Get CMS data from storage via observable
    const sectorDataObservable = new Observable((subscriber) => {
      subscriber.next(JSON.parse(sessionStorage.getItem('sectorData')));
      subscriber.complete();
    });

    if (this.appSettingsService.isBrowser) {
      this.dataSub = forkJoin({
        organizationData: this.singleService.getSingleOrganization(id),
        sectorData: !sessionStorage.getItem('sectorData')
          ? this.cmsContentService.getSectors()
          : sectorDataObservable,
      }).subscribe((response: any) => {
        const orgCMSData = response.sectorData
          ?.map((sector) => sector.organizations)
          .flat()
          .find((org) => org.link === id);

        this.responseData = response.organizationData;
        const orgData = response.organizationData.organizations[0];

        if (orgData) {
          // Set visualization url
          if (orgCMSData?.iframe.trim().length > 0)
            orgData.visualIframeUrl = orgCMSData.iframe;

          switch (this.localeId) {
            case 'fi': {
              this.setTitle(orgData.name + ' - Tiedejatutkimus.fi');
              break;
            }
            case 'en': {
              this.setTitle(orgData.name.trim() + ' - Research.fi');
              break;
            }
            case 'sv': {
              this.setTitle(orgData.name.trim() + ' - Forskning.fi');
              break;
            }
          }
          const titleString = this.utilityService.getTitle();
          this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
          this.utilityService.addMeta(
            titleString,
            this.metaTags['description' + this.currentLocale],
            this.commonTags['imgAlt' + this.currentLocale]
          );
          this.shapeData(orgData);
        }
      });
    }
  }

  shapeData(data) {
    const source = data;

    // Name translations
    source.nameTranslations = Object.values(source.nameTranslations)
      .filter((x) => UtilityService.stringHasContent(x))
      .join('; ');
  }

  // Prevent reloading of iFrame visualization
  changeTab(event) {
    this.showVisual = event.index === 0;
  }

  getNews() {
    this.newsSub = this.searchService
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
