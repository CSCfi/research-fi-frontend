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
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { Subscription } from 'rxjs';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { Search } from 'src/app/portal/models/search.model';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-single-funding',
  templateUrl: './single-funding.component.html',
  styleUrls: ['./single-funding.component.scss'],
})
export class SingleFundingComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  tab = 'fundings';
  private metaTags = MetaTags.singleFunding;
  private commonTags = MetaTags.common;
  public academyOfFinland = this.translateAcademyOfFinland(this.localeId);

  info = [
    { label: $localize`Akronyymi`, field: 'acronym' },
    {
      label: $localize`Hankkeen kuvaus`,
      field: 'description',
      tooltip: $localize`:@@sfDescriptionTooltip:Kuvaus kertoo tiiviisti hankkeen tavoitteesta`,
    },
    {
      label: $localize`Aloitusvuosi`,
      field: 'startYear',
      tooltip: $localize`:@@sfStartYearTooltip:Vuosi, jolle rahoitus on myönnetty. Useampivuotisissa rahoituksissa ensimmäinen vuosi.`,
    },
    {
      label: $localize`Päättymisvuosi`,
      field: 'endYear',
      tooltip: $localize`:@@sfEndYearTooltip:Rahoituskauden päättymisvuosi. Useamman päätöksen kokonaisuudessa viimeisimmän päätöksen päättymisvuosi.`,
    },
  ];

  funder = [
    {
      label: $localize`:@@typeOfFunding:Rahoitusmuoto`,
      field: 'typeOfFundingName',
      tooltip: $localize`:@@sfTypeOfFundingTooltip:Tapa rahoittaa tutkimusta. Rahoitusmuotoja ovat esimerkiksi tutkimusapuraha, hankerahoitus ja tutkimusinfrastruktuurirahoitus. Rahoitusmuodot ovat usein rahoittajakohtaisia.`,
    },
    {
      label: $localize`:@@frameworkProgramme:Puiteohjelma`,
      field: 'frameworkProgramme',
      tooltip: 'Puiteohjelma',
    },
    // {label: $localize`Haku`, field: 'callProgrammeName', tooltip: $localize`:@@sfCallProgrammeTooltip:Rahoittajan haku, josta rahoitus on myönnetty. Kilpailtu tutkimusrahoitus myönnetään usein avoimien hakujen kautta, joissa rahoituksen myöntämisen perusteena ovat ennalta määrätyt kriteerit. Hakemukset arvioidaan ja rahoitus myönnetään kriteerien ja muiden tavoitteiden perusteella parhaiksi katsotuille hakemuksille.`}
  ];

  other = [
    {
      label: $localize`:@@funderProjectNumber:Rahoituspäätöksen numero`,
      field: 'funderProjectNumber',
    },
    {
      label: $localize`:@@fieldsOfScience:Tieteenalat`,
      field: 'fieldsOfScience',
      tooltip: $localize`:@@fieldOfScienceTooltip:Tilastokeskuksen tieteenalaluokitus. Yhteen hankkeeseen voi liittyä useita tieteenaloja. Kaikki rahoittajat eivät käytä tieteenalaluokitusta.`,
    },
    {
      label: $localize`Tutkimusalat`,
      field: 'fieldsOfResearch',
      tooltip: $localize`:@@fieldsOfResearchTooltip:Suomen Akatemian luokittelee hankkeensa myös oman tutkimusalaluokittelunsa mukaisesti.`,
    },
    { label: $localize`Teema-alat`, field: 'fieldsOfTheme' },
    { label: $localize`:@@fundingHomePage:Hankkeen verkkosivu`, field: '?' },
    { label: $localize`:@@keywords:Avainsanat`, field: 'keywords' },
    {
      label: $localize`:@@identifiedTopics:Tunnistetut aiheet`,
      field: 'topics',
      tooltip: $localize`:@@identifiedTopicsTooltip:Koneoppimisen avulla hankkeiden tiedoista tutkimustietovarannossa muodostettu aiheluokittelu. Hanke liittyy aiheeseen, jota se todennäköisimmin käsittelee. Kaikista hankkeista ei ole riittävästi tietoa aiheen päättelyyn.`,
    },
  ];

  link = [
    { label: $localize`:@@links:Linkit`, field: 'projectHomepage' },
    { label: $localize`:@@links:Linkit`, field: 'funderProjectNumber' }, // For eu-funding only
  ];

  recipientTooltip = {
    tooltip: $localize`Rahoituksen saaja voi olla henkilö tai organisaatio. Usein saajaksi mainittu henkilö on vastuullinen tutkija, joka ei itse käytä myönnettyä rahoitusta vaan sillä katetaan hankkeen kustannuksia.`,
  };

  fundingAmountTooltip = {
    tooltip: $localize`:@@fundingAmountTooltip:Rahoittajan hankkeelle myöntämä yhteissumma. Summa ei sisällä hankkeen kaikkia kustannuksia. Organisaatio, jossa hanke toteutetaan, voi rahoittaa siitä tietyn osan (ns. omarahoitusosuus) ja hankkeella voi olla muitakin rahoittajia.`,
  };

  relatedFundingsTooltip = {
    tooltip: $localize`:@@relatedFundingTooltip:Rahoituspäätökseen liittyvät muut päätökset, kuten esimerkiksi samalle hankkeelle myönnetty tutkimuskulurahoitus. Sisältää tiedot liittyvän päätöksen tunnisteesta, rahoitusmuodosta, aloitusvuodesta sekä myönnetyn rahoituksen määrästä.`,
  };

  funderTooltip = {
    tooltip: $localize`:@@singleFundingFunderTooltip:Tutkimusrahoittaja, joka on myöntänyt rahoituksen. Kaikki tiedejatutkimus.fi \u2011palveluun tietoja toimittavat tutkimusrahoittajat ovat organisaatiot-osiossa.`,
  };

  callProgrammeTooltip = {
    tooltip: $localize`:@@sfCallProgrammeTooltip:Rahoittajan haku, josta rahoitus on myönnetty. Kilpailtu tutkimusrahoitus myönnetään usein avoimien hakujen kautta, joissa rahoituksen myöntämisen perusteena ovat ennalta määrätyt kriteerit. Hakemukset arvioidaan ja rahoitus myönnetään kriteerien ja muiden tavoitteiden perusteella parhaiksi katsotuille hakemuksille.`,
  };

  homepageTooltip = {
    tooltip: $localize`Tiedejatutkimus.fi -palvelun ulkopuolella oleva verkkosivu, jossa hankkeesta on tarkempaa tietoa.`,
  };

  cordisLink = 'https://cordis.europa.eu/programme/id/';
  cordisProjectLink = 'https://cordis.europa.eu/project/id/';
  euraLink = 'https://www.eura2014.fi/rrtiepa/projekti.php?projektikoodi=';

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  idSub: Subscription;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;

  expand: boolean;
  infoFields: any[];
  fundedFields: any[];
  otherFields: any[];
  linkFields: any[];
  funderFields: any[];
  currentLocale: string;
  tabData: any;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;
  relatedData: any;
  focusSub: Subscription;
  dataSub: Subscription;

  hasFundedPerson = false;

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    @Inject(LOCALE_ID) protected localeId: string,
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
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.fundings;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'fundings'
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

  getData(id) {
    // Check if id is number, convert to -1 if string to get past elasticsearch number mapping
    const idNumber = parseInt(id, 10) ? id : -1;
    this.dataSub = this.singleService
      .getSingleFunding(idNumber)
      // .pipe(map(responseData => [responseData]))
      .subscribe({
        next: (responseData) => {
          this.responseData = responseData;
          const funding = this.responseData.fundings[0];
          if (funding) {
            switch (this.localeId) {
              case 'fi': {
                this.setTitle(funding.name + ' - Tiedejatutkimus.fi');
                break;
              }
              case 'en': {
                this.setTitle(funding.name + ' - Research.fi');
                break;
              }
              case 'sv': {
                this.setTitle(funding.name + ' - Forskning.fi');
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
            this.shapeData();
            this.filterData();
          }
        },
        error: (error) => (this.errorMessage = error as any),
      });
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.fundings[0][item.field]
      );
    };

    const checkNestedEmpty = (parent: string, item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.fundings[0][parent][item.field]
      );
    };

    // Filter all the fields to only include properties with defined data
    this.infoFields = Object.assign(
      this.info.filter((item) => checkEmpty(item))
    );
    // this.fundedFields = Object.assign(this.funded.filter(item => checkEmpty(item)));
    this.otherFields = Object.assign(
      this.other.filter((item) => checkEmpty(item))
    );
    this.linkFields = Object.assign(
      this.link.filter((item) => checkEmpty(item))
    );
    // Same for nested fields
    this.funderFields = Object.assign(
      this.funder.filter((item) => checkNestedEmpty('funder', item))
    );
    // Filter out empty organization names
    this.responseData.fundings[0].recipient.organizations =
      this.responseData.fundings[0].recipient.organizations.filter(
        (item) => item.name !== '' && item.name !== null
      );

    // Filter funderProjectNumber from links for non eu funding
    if (!this.responseData.fundings[0].euFunding) {
      this.linkFields = this.linkFields.filter(
        (item) => item.field !== 'funderProjectNumber'
      );
    }
  }

  private hasFundedPersons(fundingItem: any) {
    if (fundingItem?.recipient?.euFundingRecipients) {
      fundingItem.recipient.euFundingRecipients.forEach((entry) => {
        if (entry.personIsFunded) {
          this.hasFundedPerson = true;
        }
      });
    }
  }

  shapeData() {
    const source = this.responseData.fundings[0];
    const locale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);

    // Get label by locale
    source.academyConsortium = source.academyConsortium
      ? source?.academyConsortium['label' + locale]
      : '';

    // Related data
    let relatedOrgs = [];
    // Filter items with sectorId, this makes sure that the organization can be found from organizations tab
    if (source.recipient.organizations.length) {
      relatedOrgs = source.recipient.organizations
        .filter((item) => item.sectorId)
        .map((item) => item.id);
    } else if (source.recipient.organizationId) {
      relatedOrgs.push(source.recipient.organizationId);
    }

    // Add funder to organizations, excluding EU as funder
    if (source.funder.businessId && !source.euFunding) {
      relatedOrgs.push(source.funder.businessId.replace('-', ''));
    }

    this.relatedData = {
      organizations: relatedOrgs,
    };
    this.hasFundedPersons(source);
  }

  shapeAmount(val) {
    return val.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ') + ' €';
  }

  expandDescription() {
    this.expand = !this.expand;
  }

  translateAcademyOfFinland(locale: string) {
    let output = "Suomen Akatemia";

    if (locale === 'en') {
      output = "Academy of Finland";
    }

    if (locale === 'sv') {
      output = "Finlands Akademi";
    }

    return output;
  }
}
