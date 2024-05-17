import {
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { Search } from '@portal/models/search.model';
import { SearchService } from '@portal/services/search.service';
import { SettingsService } from '@portal/services/settings.service';
import { SingleItemService } from '@portal/services/single-item.service';
import { TabChangeService } from '@portal/services/tab-change.service';
import { UtilityService } from '@shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { DOCUMENT } from '@angular/common';
@Component({
  selector: 'app-single-funding-call',
  templateUrl: './single-funding-call.component.html',
  styleUrls: ['./single-funding-call.component.scss'],
})
export class SingleFundingCallComponent implements OnInit {
  newUiToggle = true;

  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  private metaTags = MetaTags.singleFundingCall;
  private commonTags = MetaTags.common;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;
  contactInfoHeading = $localize`:@@contactInfo:Yhteystiedot`;

  tab = 'funding-calls';

  applicationPeriodFields = [
    { label: $localize`:@@applicationPeriod:Hakuaika`, field: '' },
  ];

  infoFields = [
    { label: $localize`:@@description:Kuvaus`, field: 'description' },
  ];

  categories = [
    {
      label: $localize`:@@fundingCallCategories:Hakualat`,
      field: 'categories',
    },
  ];

  applicationInfoFields = [
    { label: $localize`:@@applicationInstructions:Hakuohjeet`, field: 'terms' },
    // { label: $localize`:@@applicationSite:Hakusivu`, field: '' },
    // { label: $localize`:@@contactInfo:Yhteystiedot`, field: 'contactInfo' }, // Check terms with aurora before enabling
  ];

  funderFields = [
    { label: $localize`:@@fundingFunder:Rahoittaja`, field: 'foundation' },
  ];

  typeOfFundingFields = {
    '75': $localize`:@@typeOfFundingId.75: `,
    "60": $localize`:@@typeOfFundingId.60:Strategisen tutkimuksen rahoitus`,
    "42": $localize`:@@typeOfFundingId.42:Kansainvälinen yhteisrahoitteinen ohjelma`,
    "35": $localize`:@@typeOfFundingId.35:Suunnattu akatemiahanke`,
    "80": $localize`:@@typeOfFundingId.80:Tutkijoiden liikkuvuus ulkomaille`,
    "19": $localize`:@@typeOfFundingId.19:Tutkimusinfrastruktuuri`,
    "37": $localize`:@@typeOfFundingId.37:Akatemiaohjelma`,
    "72": $localize`:@@typeOfFundingId.72:Tutkijoiden liikkuvuus Suomeen`,
    "90": $localize`:@@typeOfFundingId.90:Lippulaivat`,
    "11": $localize`:@@typeOfFundingId.11:Muu tieteen edistäminen`,
    "27": $localize`:@@typeOfFundingId.27:Akatemiahanke`,
    "61": $localize`:@@typeOfFundingId.61:Akatemiaohjelman kansainvälinen tutkimushanke`,
    "65": $localize`:@@typeOfFundingId.65:Tutkijatohtorin tehtävä`,
    "66": $localize`:@@typeOfFundingId.66:Akatemiatutkijan tehtävä`,
  }

  /*
  ""
  "75": " "
  "60": "Strategisen tutkimuksen rahoitus"
  "42": "Kansainvälinen yhteisrahoitteinen ohjelma"
  "35": "Suunnattu akatemiahanke"
  "80": "Tutkijoiden liikkuvuus ulkomaille"
  "19": "Tutkimusinfrastruktuuri"
  "37": "Akatemiaohjelma"
  "72": "Tutkijoiden liikkuvuus Suomeen"
  "90": "Lippulaivat"
  "11": "Muu tieteen edistäminen"
  "27": "Akatemiahanke"
  "61": "Akatemiaohjelman kansainvälinen tutkimushanke"
  "65": "Tutkijatohtorin tehtävä"
  "66": "Akatemiatutkijan tehtävä"
  */

  /*
  " "
  "Strategisen tutkimuksen rahoitus"
  "Kansainvälinen yhteisrahoitteinen ohjelma"
  "Suunnattu akatemiahanke"
  "Tutkijoiden liikkuvuus ulkomaille"
  "Tutkimusinfrastruktuuri"
  "Akatemiaohjelma"
  "Tutkijoiden liikkuvuus Suomeen"
  "Lippulaivat"
  "Muu tieteen edistäminen"
  "Akatemiahanke"
  "Akatemiaohjelman kansainvälinen tutkimushanke"
  "Tutkijatohtorin tehtävä"
  "Akatemiatutkijan tehtävä"
  "Akatemiatutkijan tutkimuskulut"
  */

  linkFields = ['url', 'foundationUrl', 'applicationUrl'];

  copyToClipboard = $localize`:@@copyToClipboard:Kopioi leikepöydälle`;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  idSub: Subscription;
  expandDescription: boolean;
  expandTerms: boolean;
  latestSubUnitYear: string;
  faIcon = faAlignLeft;
  subUnitSlice = 10;
  currentLocale: string;
  tabData: any;
  focusSub: Subscription;
  dataSub: Subscription;
  contactInfoName = null;
  contactInfoEmail = null;
  contactInfoRows = [];

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
    @Inject(DOCUMENT) private document: any,
    private tabChangeService: TabChangeService,
    public utilityService: UtilityService,
    private settingsService: SettingsService,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe((params) => {
      this.getData(params.id);
    });
    this.singleId = this.route.snapshot.params.id;
    //this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams['funding-calls'];
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'fundingCalls'
    );
    this.searchTerm = this.searchService.searchTerm;
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
    this.dataSub?.unsubscribe();
    this.settingsService.related = false;
  }

  convertHttpLinks(input: string) {
    // Converts href links to external, considered safe by Angular, or tries to generate links
    if (input.includes('href="')){
      input = input.replace('target="_blank" ', '');
      input = input.replace('rel="noopener" ', '');
      input = input.replace('class="external-link" ', '');
      input = input.replace('href=','class="external-link" target="_blank" rel="noopener" href=');
    } else {
      // No href found from text, try to generate links. Match URLs starting with http://, https://
      const regexPattern = /(\b(https?):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
      input = input.replace(regexPattern, '<a href="$1" class="external-link" target="_blank" rel="noopener">$1</a>');
    }
    return input;
  }

  processContactInfo(input: string) {
    if (input?.length > 0) {
      const splitArr = input.split(',');
      this.contactInfoName = splitArr[0];
      if (splitArr.length > 0) {
        this.contactInfoName = splitArr[0];
      }
      if (splitArr.length > 1) {
        this.contactInfoEmail = splitArr[2];
      }
    }
  }

  removeHtmlTags(input: string) {
    input = input?.length > 0 ? input.replace(/(<([^>]+)>)/gi, '') : '';
    return input;
  }

  processPossibleEmailRow(input: string) {
    if (
      input.toLowerCase().includes('(at)') ||
      input.toLowerCase().includes('(a)') ||
      input.includes('@')
    ) {
      return {
        label: $localize`Sähköpostiosoite`,
        field: 'emailAddress',
        email: input,
      };
    }
    return input;
  }

  showEmail(event, address) {
    const span = this.document.createElement('span');
    span.innerHTML = address;
    event.target.replaceWith(span);
  }

  getData(id: string) {
    this.dataSub = this.singleService.getSingleFundingCall(id).subscribe({
      next: (responseData) => {
        this.responseData = responseData;

        const fundingCall = this.responseData.fundingCalls[0];

        if (fundingCall) {
          this.addTopLevelScienceAreas(fundingCall);
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(fundingCall.name + ' - Tiedejatutkimus.fi');
              break;
            }
            case 'en': {
              this.setTitle(fundingCall.name.trim() + ' - Research.fi');
              break;
            }
            case 'sv': {
              this.setTitle(fundingCall.name.trim() + ' - Forskning.fi');
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
          this.filterData();
        }
      },
      error: (error) => (this.errorMessage = error as any),
    });
  }

  addTopLevelScienceAreas(responseData: any) {
    const topLevelCatsAr = [];
    const retCategories = [];
    responseData?.categories.forEach((cat) => {
      topLevelCatsAr.includes(cat.parentName)
        ? null
        : topLevelCatsAr.push(cat.parentName);
    });
    topLevelCatsAr.sort((a, b) => (a > b ? 1 : b > a ? -1 : 0));
    topLevelCatsAr.forEach((topCat) => {
      retCategories.push({ name: topCat, isParent: true });
      responseData?.categories.forEach((cat) => {
        if (cat?.parentName === topCat) {
          retCategories.push({ name: cat.name, isParent: false });
        }
      });
    });
    responseData.categories = [...retCategories];
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.fundingCalls[0][item.field]
      );
    };
    // Strip HTML tags from content
    // DOMParser not supported in SSR
    const parseString = (item: { field: string }) => {
      if (this.appSettingsService.isBrowser) {
        let doc = new DOMParser().parseFromString(
          this.responseData.fundingCalls[0][item.field],
          'text/html'
        );
        return doc.body.textContent || '';
      }
    };

    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    this.applicationInfoFields = this.applicationInfoFields.filter((item) =>
      checkEmpty(item)
    );

    const contactInfo =
      this.responseData.fundingCalls[0]?.contactInfo.split(/[\n,;]/);
    contactInfo.forEach((info) => {
      if (info.length > 0) {
        this.contactInfoRows.push(
          this.processPossibleEmailRow(this.removeHtmlTags(info))
        );
      }
    });

    // Short version is not HTML formatted
    this.applicationInfoFields.forEach((item) => {
      this.responseData.fundingCalls[0][item.field + 'short'] =
        this.convertHttpLinks(parseString(item));
    });
    this.responseData.fundingCalls[0].terms = this.convertHttpLinks(this.responseData.fundingCalls[0]?.terms);
    this.responseData.fundingCalls[0].description = this.convertHttpLinks(this.responseData.fundingCalls[0]?.description);
  }

  expand(field: string) {
    switch (field) {
      case 'description':
        this.expandDescription = !this.expandDescription;
        break;
      case 'terms':
        this.expandTerms = !this.expandTerms;
        break;
    }
  }
}
