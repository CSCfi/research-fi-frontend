import {
  Component,
  ElementRef,
  Inject,
  LOCALE_ID,
  OnInit,
  ViewChild,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { Subscription } from 'rxjs';
import { Search } from 'src/app/portal/models/search.model';
import { SearchService } from 'src/app/portal/services/search.service';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { SingleItemService } from 'src/app/portal/services/single-item.service';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { singleFundingCall, common } from 'src/assets/static-data/meta-tags.json';
@Component({
  selector: 'app-single-funding-call',
  templateUrl: './single-funding-call.component.html',
  styleUrls: ['./single-funding-call.component.scss']
})
export class SingleFundingCallComponent implements OnInit {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  private metaTags = singleFundingCall;
  private commonTags = common;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;

  tab = 'funding-calls';

  applicationPeriodFields = [
    { label: $localize`:@@applicationPeriod:Hakuaika`, field: '' },
  ];

  infoFields = [
    { label: $localize`:@@description:Kuvaus`, field: 'description' },
  ];

  categories = [
    { label: $localize`:@@fundingCallCategories:Hakualat`, field: 'categories' },
  ];
  
  applicationInfoFields = [
    { label: $localize`:@@applicationInstructions:Hakuohjeet`, field: 'terms' },
    // { label: $localize`:@@applicationSite:Hakusivu`, field: '' },
    // { label: $localize`:@@contactInfo:Yhteystiedot`, field: 'contactInfo' }, // Check terms with aurora before enabling
  ]
  
  funderFields = [
    { label: $localize`:@@fundingFunder:Rahoittaja`, field: 'foundation' },
  ]

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

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    private titleService: Title,
    @Inject(LOCALE_ID) protected localeId: string,
    private tabChangeService: TabChangeService,
    public utilityService: UtilityService,
    private settingsService: SettingsService
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
      this.getData(params.id);
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.fundingCall;
    this.tabData = this.tabChangeService.fundingCall;
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
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.singleService.getSingleFundingCall(id).subscribe(
      (responseData) => {
        this.responseData = responseData;
        if (this.responseData.fundingCalls[0]) {
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(
                this.responseData.fundingCalls[0].name + ' - Tiedejatutkimus.fi'
              );
              break;
            }
            case 'en': {
              this.setTitle(
                this.responseData.fundingCalls[0].name.trim() + ' - Research.fi'
              );
              break;
            }
            case 'sv': {
              this.setTitle(
                this.responseData.fundingCalls[0].name.trim() + ' - Forskning.fi'
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
          this.filterData();
        }
      },
      (error) => (this.errorMessage = error as any)
    );
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.fundingCalls[0][item.field]
      );
    };
    // Strip HTML tags from content
    const parseString = (item: {field: string }) => {
      let doc = new DOMParser().parseFromString(this.responseData.fundingCalls[0][item.field] ,'text/html');
      return doc.body.textContent || '';
    }
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    this.applicationInfoFields = this.applicationInfoFields.filter((item) => checkEmpty(item));

    // Short version is not HTML formatted
    this.applicationInfoFields.forEach((item) => { this.responseData.fundingCalls[0][item.field + 'short'] = parseString(item) })
  }

  shapeData() {
    const source = this.responseData.fundingCalls[0];
  }

  expand(field: string) {
    switch (field) { 
      case 'description':
        this.expandDescription = !this.expandDescription;
        break;
      case 'terms':
        this.expandTerms = !this.expandTerms;
        break
    }
  }
}
