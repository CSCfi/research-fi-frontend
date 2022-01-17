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
  TemplateRef,
  LOCALE_ID,
  AfterViewInit,
} from '@angular/core';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { StaticDataService } from '../../../services/static-data.service';
import { SettingsService } from '../../../services/settings.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { faQuoteRight, faCopy } from '@fortawesome/free-solid-svg-icons';
import { HttpHeaders } from '@angular/common/http';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { Search } from 'src/app/portal/models/search.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-single-publication',
  templateUrl: './single-publication.component.html',
  styleUrls: ['./single-publication.component.scss'],
})
export class SinglePublicationComponent
  implements OnInit, AfterViewInit, OnDestroy
{
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tab = 'publications';
  tabQueryParams: any;
  private metaTags = MetaTags.singlePublication;
  private commonTags = MetaTags.common;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;

  infoFields = [
    {
      label: $localize`:@@yearOfPublication:Julkaisuvuosi`,
      field: 'publicationYear',
    },
    {
      label: $localize`:@@publicationAuthors:Tekijät`,
      field: 'authors',
      tooltip: $localize`:@@publicationAuthorsTooltip:Julkaisun tekijät siinä järjestyksessä, jossa ne on listattu alkuperäisessä julkaisussa. Jos tekijöitä on yli 20, kaikkia ei ole välttämättä ilmoitettu.`,
    },
    {
      label: $localize`:@@abstract:Tiivistelmä`,
      field: 'abstract',
    },
  ];

  authorAndOrganization = [];

  organizationSubFields = [
    {
      label: $localize`:@@orgOrganization:Organisaatio`,
      field: 'organizationId',
    },
  ];

  typeFields = [
    {
      label: $localize`:@@publicationFormat:Julkaisumuoto`,
      field: 'format',
      tooltip:
        '<p><strong>' +
        $localize`:@@article:Artikkeli` +
        ': </strong>' +
        $localize`:@@articleTooltipContent:Sisältää alkuperäis- ja katsausartikkelit, kirjan tai lehden johdannot ja esipuheet, lyhyet tutkimusselostukset, pääkirjoitukset, keskustelupuheenvuorot ja kommentit. ` +
        '</p><p><strong>' +
        $localize`:@@monograph:Erillisteos` +
        ': </strong>' +
        $localize`:@@monographTooltipContent:Sisältää monografiat/kirjat, tutkimus- ja kehitystyöhön perustuva kehittämis- tai tutkimusraportti, selvitykset, ns. white paperit sekä working papers ja discussion papers -tyyppiset julkaisut. ` +
        '</p><p><strong>' +
        $localize`:@@editorial:Toimitustyö` +
        ': </strong>' +
        $localize`:@@editorialTooltipContent:Sisältää useista eri kirjoittajien artikkeleista koostuvan tieteellisen kirjan tai lehden erikoisnumeron toimitustyöt ` +
        '</p><p><strong>' +
        $localize`:@@abstract:Abstrakti` +
        ': </strong>' +
        $localize`:@@abstractTooltipContent:Sisältää konferenssiesitelmien abstraktit sekä laajennetut abstraktit.` +
        '</p><p><strong>' +
        $localize`:@@poster:Posteri` +
        ': </strong>' +
        $localize`:@@posterTooltipContent:Sisältää konferenssiesitelmien posterit.` +
        '</p><p><strong>' +
        $localize`:@@blog:Blogikirjoitus` +
        ': </strong>' +
        $localize`:@@blogTooltipContent:Sisältää blogimuotoiset julkaisut, joiden julkaisemisesta on päättänyt riippumaton toimituskunta tai joiden julkaisualustalla on ISSN-tunnus.`,
    },
    {
      label: $localize`:@@parentPublicationType:Emojulkaisun tyyppi`,
      field: 'parentPublicationType',
      tooltip:
        '<p><strong>' +
        $localize`:@@journal:Lehti` +
        ': </strong>' +
        $localize`:@@journalTooltipContent:Sisältää tieteelliset aikakauslehdet ja ammattilehdet.` +
        '</p><p><strong>' +
        $localize`:@@researchBook:Kokoomateos` +
        ': </strong>' +
        $localize`:@@researchBookTooltipContent:Sisältää tieteelliset kokoomateokset, tieteelliset vuosikirjat ja vastaavat, ammatilliset käsi- tai opaskirjat, ammatilliset tietojärjestelmät tai kokoomateokset, oppikirja-aineistot sekä lyhyet ensyklopediatekstit. ` +
        '</p><p><strong>' +
        $localize`:@@conferencePlatform:Konferenssialusta` +
        ': </strong>' +
        $localize`:@@conferencePlatformTooltipContent:Sisältää konferenssin painetut tai julkisesti saatavilla olevat julkaisut, ns. proceedings-julkaisut.` +
        '<p><strong>' +
        $localize`:@@onlinePlatform:Verkkoalusta` +
        ': </strong>' +
        $localize`:@@onlinePlatformTooltipContent: Sisältää muilla sähköisillä alustoilla julkaistut julkaisut.`,
    },
    {
      label: $localize`:@@articleType: Artikkelin tyyppi`,
      field: 'articleTypeText',
      tooltip:
        '<p><strong>' +
        $localize`:@@originalArticle:Alkuperäisartikkeli` +
        ' </strong>' +
        $localize`:@@originalArticleTooltip:on pääosin aiemmin julkaisemattomasta materiaalista koostuva tieteellinen artikkeli.` +
        '</p><p><strong>' +
        $localize`:@@reviewArticle:Katsausartikkeli` +
        ' </strong>' +
        $localize`:@@reviewArticleTooltip:perustuu aikaisempiin samasta aihepiiristä tehtyihin julkaisuihin.` +
        '</p><p><strong>' +
        $localize`:@@dataArticle:Data-artikkeli` +
        ' </strong>' +
        $localize`:@@dataArticleTooltip:sisältää ns. data journals -julkaisuissa ilmestyneet, tutkimusaineistoja kuvailevat artikkelit.` +
        '</p><p><strong>' +
        $localize`:@@otherArticle:Muu artikkeli` +
        ' </strong>' +
        $localize`:@@otherArticleTooltip:sisältää muihin luokkiin kuulumattomat artikkelit.`,
    },
    {
      label: $localize`:@@audience:Yleisö`,
      field: 'audience',
      tooltip:
        '<p>' +
        $localize`:@@publicationChannelAudience:Julkaisukanavan kohdeyleisö` +
        '</p>' +
        '<p><strong>' +
        $localize`:@@scientificPublication:Tieteellinen julkaisu` +
        ': </strong>' +
        $localize`:@@scientificPublicationTooltipContent:Julkaisut, jotka on tarkoitettu edistämään tiedettä sekä tuottamaan uutta tietoa.` +
        '</p><p><strong>' +
        $localize`:@@professionalPublication:Ammatillinen julkaisu` +
        ': </strong>' +
        $localize`:@@professionalPublicationTooltipContent:Julkaisut, jotka levittävät tutkimukseen ja kehitystyöhön perustuvaa tietoa ammattiyhteisön käyttöön.` +
        '</p><p><strong>' +
        $localize`:@@popularPublication:Yleistajuinen julkaisu` +
        ': </strong>' +
        $localize`:@@popularPublicationTooltipContent:Julkaisut, jotka levittävät tutkimus- ja kehitystyöhön perustuvaa tietoa suurelle yleisölle ja joiden sisällön ymmärtäminen ei edellytä erityistä perehtyneisyyttä alaan.`,
    },
    {
      label: $localize`:@@peerReviewedFilter:Vertaisarvioitu`,
      field: 'peerReviewed',
      tooltip: $localize`:@@peerReviewedTooltip:Tieteellisten julkaisujen vertaisarvioinnilla tarkoitetaan menettelyä, jossa tutkimustuloksia julkaiseva lehti, konferenssi tai kirjakustantaja pyytää tieteenalan asiantuntijoita suorittamaan ennakkoarvion julkaistavaksi tarjottujen käsikirjoitusten tieteellisestä julkaisukelpoisuudesta.`,
    },
    {
      label: $localize`:@@OKMPublicationType:OKM:n julkaisutyyppiluokitus`,
      field: 'publicationTypeCode',
    },
  ];

  mediumFields = [
    {
      label: $localize`Lehti`,
      field: 'journalName',
      link: true,
      linkPath: '/results/publications/' /*, lang: true */,
    },
    {
      label: $localize`Emojulkaisun nimi`,
      field: 'parentPublicationName',
      link: true,
      linkPath: '/results/publications/',
    },
    {
      label: $localize`:@@parentPublicationPublisher:Emojulkaisun toimittajat`,
      field: 'parentPublicationPublisher',
      link: false,
      linkPath: '/results/publications/',
    },
    {
      label: $localize`Konferenssi`,
      field: 'conferenceName',
      link: true,
      linkPath: '/results/publications/' /*, lang: true */,
    },
    {
      label: $localize`Kustantaja`,
      field: 'publisherName',
      link: true,
      linkPath: '/results/publications/' /*, lang: true */,
    },
    { label: $localize`Volyymi`, field: 'volume', link: false },
    { label: $localize`Numero`, field: 'issueNumber', link: false },
    { label: $localize`Sivut`, field: 'pageNumbers', link: false },
    {
      label: 'ISSN',
      field: 'issn',
      link: true,
      linkPath: '/results/publications/',
    },
    {
      label: 'ISBN',
      field: 'isbn',
      link: true,
      linkPath: '/results/publications/',
    },
    // \u00AD soft hyphen, break word here if needed
    {
      label: $localize`Julkaisu\u00ADfoorumi`,
      field: 'jufoCode',
      link: true,
      linkPath:
        'https://jfp.csc.fi/en/web/haku/julkaisukanavahaku#!PublicationInformationView/id/',
      tooltip: $localize`Julkaisukanavan tunniste Julkaisufoorumissa (www.julkaisufoorumi.fi).`,
    },
    {
      label: $localize`:@@jufoLevel:Julkaisufoorumitaso`,
      field: 'jufoClassCode',
      link: false,
      linkPath: '/results/publications?page=1&juFo=',
    },
  ];

  open_accessFields = [
    {
      label: $localize`:@@publisherOpenAccess:Avoin saatavuus kustantajan palvelussa`,
      field: 'openAccessText',
      link: false,
    },
    {
      label: $localize`:@@publicationChannelOa:Julkaisukanavan avoin saatavuus`,
      field: 'publisherOpenAccessText',
      link: false,
      tooltip:
        '<p>' +
        $localize`:@@publicationChannelType:Julkaisun julkaisukanavan avoimen saatavuuden tyyppi.` +
        '</p>' +
        '<p><strong>' +
        $localize`:@@OaFullyOpen:Kokonaan avoin julkaisukanava` +
        ': </strong>' +
        $localize`:@@OaFullyOpenTooltipContent:Julkaisukanavan kaikki julkaisut ovat välittömästi ja pysyvästi avoimesti saatavilla kustantajan palvelussa.` +
        '</p><p><strong>' +
        $localize`:@@OaPartiallyOpen:Osittain avoin julkaisukanava` +
        ': </strong>' +
        $localize`:@@OaPartiallyOpenTooltipContent:Osa julkaisukanavan julkaisuista on välittömästi ja pysyvästi avoimesti saatavilla kustantajan palvelussa. Esimerkiksi hybridilehdet.` +
        '</p><p><strong>' +
        $localize`:@@OaDelayed:Viivästetysti avoin julkaisukanava` +
        ': </strong>' +
        $localize`:@@OaDelayedTooltipContent:Osa tai kaikki julkaisukanavan julkaisuista avoimia kustantajan palvelussa vasta kustantajan määrittämän viiveajan (embargo) jälkeen.`,
    },
    {
      label: $localize`:@@publisherLicenseVersion:Kustantajan version lisenssi`,
      field: 'licenseText',
      link: false,
      tooltip: $localize`:@@pubLicenseTooltip:Kustantajan palvelussa sijaitsevan julkaisun lisenssitieto.`,
    },
    {
      label: $localize`:@@selfArchived:Rinnakkaistallennettu`,
      field: 'archiveCodeText',
      link: false,
      tooltip: $localize`:@@selfArchivedTooltip:Julkaisusta avoimesti saatavilla oleva rinnakkaistallenne on tieteenala- tai organisaatiokohtaisessa julkaisuarkistossa.`,
    },
    {
      label: $localize`:@@archivedLicenseVersion:Rinnakkaistallenteen versio`,
      field: 'archiveCodeVersionText',
      link: false,
      tooltip:
        '<p><strong>' +
        $localize`:@@publisherVersion:Kustantajan versio` +
        ': </strong>' +
        $localize`:@@publisherVersionTooltip:Kustantajan palvelussa julkaistu artikkeli.` +
        '</p><p><strong>' +
        $localize`:@@finalDraft:Viimeinen käsikirjoitusversio` +
        ': </strong>' +
        $localize`:@@finalDraftTooltip:Kustantajalle lähetetty viimeinen (vertaisarvioitu) versio käsikirjoituksesta, joka on hyväksytty julkaistavaksi.` +
        '</p>',
    },
    {
      label: $localize`:@@archivedLicense:Rinnakkaistallenteen lisenssi`,
      field: 'archiveCodeLincenseText',
      link: false,
      tooltip: $localize`:@@selfLicenseTooltip:Tieteenala- tai organisaatiokohtaisessa julkaisuarkistossa sijaitsevan rinnakkaistallenteen lisenssitieto.`,
    },
    {
      label: $localize`:@@embargoDate:Rinnakkaistallenteen julkaisuviiveen (embargo) päättymispäivä`,
      field: 'archiveEbargoDate',
      link: false,
    },
    {
      label: $localize`:@@apcFee:Avoimen saatavuuden kirjoittajamaksu €`,
      field: 'apcFee',
      link: false,
      tooltip:
        '<p>' +
        $localize`:@@apcTooltip:Julkaisun avoimesta julkaisemisesta maksettu summa euroina.` +
        '</p><p>' +
        $localize`:@@apcJointPublication:Yhteisjulkaisuissa julkaisumaksu voi olla yhden tai useamman julkaisuun osallistuneen organisaation maksama. Julkaisumaksun summa voi myös olla puutteellinen, jos kaikkien organisaatioiden maksuja ei ole ilmoitettu.` +
        '</p>',
    },
    {
      label: $localize`:@@apcPaymentYear:Avoimen saatavuuden kirjoittajamaksun vuosi`,
      field: 'apcPaymentYear',
      link: false,
    },
  ];

  linksFields = [
    { label: 'DOI', field: 'doi', path: 'https://doi.org/' },
    { label: '', field: 'doiHandle' },
  ];

  otherFields = [
    {
      label: $localize`:@@fieldsOfScience:Tieteenalat`,
      field: 'fieldsOfScienceString',
      tooltip: $localize`:@@TKFOS:Tilastokeskuksen luokituksen mukaiset tieteenalat.`,
    },
    { label: $localize`:@@keywords:Avainsanat`, field: 'keywords' },
    /*{
      label: $localize`:@@openAccess:Avoin saatavuus`,
      field: 'openAccessText',
      tooltip:
        '<p><strong>' +
        $localize`:@@openAccessPublicationChannel:Open access -julkaisukanava` +
        ': </strong>' +
        $localize`Julkaisu on ilmestynyt julkaisukanavassa, jonka kaikki julkaisut ovat avoimesti saatavilla.` +
        '</p><p><strong>' +
        $localize`:@@selfArchived:Rinnakkaistallennettu` +
        ': </strong>' +
        $localize`Julkaisu on tallennettu organisaatio- tai tieteenalakohtaiseen julkaisuarkistoon joko välittömästi tai kustantajan määrittämän kohtuullisen embargoajan jälkeen.` +
        '</p><p><strong>' +
        $localize`:@@otherOpenAccess:Muu avoin saatavuus` +
        ': </strong>' +
        $localize`Julkaisu on avoimesti saatavilla, mutta se on ilmestynyt ns. hybridijulkaisukanavassa, jossa kaikki muut julkaisut eivät ole avoimesti saatavilla.` +
        '</p>',
    },
    */
    { label: $localize`:@@publicationCountry:Julkaisumaa`, field: 'countries' },
    { label: $localize`:@@language:Kieli`, field: 'languages' },
    {
      label: $localize`:@@intCoPublication:Kansainvälinen yhteisjulkaisu`,
      field: 'internationalCollaboration',
      tooltip: $localize`:@@intCoPublicationAuthors:Kv. yhteisjulkaisussa on tekijöitä myös muualta kuin suomalaisista tutkimusorganisaatioista`,
    },
    {
      label: $localize`:@@publicationWithCompany:Yhteisjulkaisu yrityksen kanssa`,
      field: 'businessCollaboration',
      tooltip: $localize`:@@publicationCompanyAuthors:Julkaisussa on tekijöitä vähintään yhdestä yrityksestä.`,
    },

    { label: 'DOI', field: 'doi' },
  ];

  publicationStatus = [
    {
      label: $localize`:@@okmDataCollection:Julkaisu kuuluu opetus- ja kulttuuriministeriön tiedonkeruuseen`,
      field: 'publicationStatusText',
      link: false,
      tooltip: $localize`:@@okmDataCollectionTooltip:OKM:n tiedonkeruuseen kuuluvat julkaisut ovat korkeakoulujen, tutkimuslaitosten ja yliopistosairaaloiden vuosittain opetus- ja kulttuuriministeriölle raportoimia julkaisuja, jotka täyttävät julkaisutiedonkeruun vaatimukset (www.tiedonkeruu.fi) ja jotka huomioidaan mm. korkeakoulujen rahoitusmallissa.`,
    },
  ];

  citationStyles = [
    { label: 'APA', cslStyle: 'apa' },
    { label: 'Chicago', cslStyle: 'chicago-author-date' },
    { label: 'MLA', cslStyle: 'mla' },
  ];

  copyToClipboard = $localize`:@@copyToClipboard:Kopioi leikepöydälle`;
  copyReferences = $localize`:@@copyReferences:Kopioi viitetiedot`;

  documentLang = this.document.documentElement.lang;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  citeButton: any;
  focusSub: Subscription;
  showDialog: boolean;
  @ViewChild('citeButton', { read: ElementRef }) set ft(btn: ElementRef) {
    this.citeButton = btn;
  }
  idSub: Subscription;
  juFoCode: any;
  expand: boolean;
  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;
  faCopy = faCopy;
  publicationType: any;
  publicationTypeLabel: string;
  showSubUnits = false;
  hasSubUnits = false;

  citations = [];
  hasDoi = false;
  relatedData = {};
  currentLocale: any;
  tabData: any;

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    public searchService: SearchService,
    private titleService: Title,
    private tabChangeService: TabChangeService,
    @Inject(DOCUMENT) private document: any,
    private staticDataService: StaticDataService,
    public utilityService: UtilityService,
    @Inject(LOCALE_ID) private localeId,
    private snackBar: MatSnackBar,
    private settingsService: SettingsService,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
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
    this.tabQueryParams = this.tabChangeService.tabQueryParams.publications;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'publications'
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
    this.settingsService.related = false;
  }

  openDialog() {
    // Get the citations if they aren't loaded yet
    if (this.citations.length < this.citationStyles.length) {
      this.getCitations();
    }
    this.showDialog = true;
  }

  openSnackBar() {
    this.snackBar.open($localize`:@@referCopied:Viite kopioitu leikepöydälle`);
  }

  getCitations() {
    const source = this.responseData.publications[0];
    const doi = this.linksFields.filter((x) => x.label === 'DOI').shift();
    // tslint:disable-next-line: curly
    if (!this.hasDoi) {
      this.citations = source.citations;
      return;
    }
    const doiUrl = source.doi;
    const url = doi.path + doiUrl;

    this.citationStyles.forEach((style, idx) => {
      const options = {
        headers: new HttpHeaders({
          Accept: 'text/x-bibliography; style=' + style.cslStyle,
        }),
        responseType: 'text',
      };
      this.searchService.getFromUrl(url, options).subscribe((res) => {
        this.citations[idx] = res;
      });
    });
  }

  getData(id: string) {
    this.singleService.getSinglePublication(id).subscribe(
      (responseData) => {
        this.responseData = responseData;

        // Reset authors & organizations on new result
        this.authorAndOrganization = [];
        const publication = this.responseData.publications[0];
        if (publication) {
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(publication.title + ' - Tiedejatutkimus.fi');
              break;
            }
            case 'en': {
              this.setTitle(publication.title + ' - Research.fi');
              break;
            }
            case 'sv': {
              this.setTitle(publication.title + ' - Forskning.fi');
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
          // juFoCode is used for exact search
          this.juFoCode = publication.jufoCode;
          this.shapeData();
          this.filterData();
          this.checkDoi();
        }
      },
      (error) => (this.errorMessage = error as any)
    );
  }

  checkDoi() {
    // Check if the doi exists (the field is filtered on init if it doesn't)
    const doi = this.linksFields.filter((x) => x.label === 'DOI').shift();
    // Flag needed for template
    this.hasDoi = !!doi;
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: { field: string }) => {
      return UtilityService.stringHasContent(
        this.responseData.publications[0][item.field]
      );
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    // this.authorFields = this.authorFields.filter(item => checkEmpty(item));
    this.organizationSubFields = this.organizationSubFields.filter((item) =>
      checkEmpty(item)
    );
    this.typeFields = this.typeFields.filter((item) => checkEmpty(item));
    this.mediumFields = this.mediumFields.filter((item) => checkEmpty(item));
    this.linksFields = this.linksFields.filter((item) => checkEmpty(item));
    this.otherFields = this.otherFields.filter((item) => checkEmpty(item));
    this.open_accessFields = this.open_accessFields.filter((item) =>
      checkEmpty(item)
    );
  }

  shapeData() {
    const locale = this.currentLocale;
    const source = this.responseData.publications[0];
    const countries = source.countries;
    const languages = source.languages;
    const keywords = source.keywords;
    const author = source.author;

    if (countries?.length > 0) {
      const key = 'country' + locale;
      source.countries = countries.map((x) => x[key]);
    }

    if (languages?.length > 0) {
      const key = 'language' + locale;
      source.languages = languages.map((x) => x[key]);
    }

    // Link with targeted search for keywords
    // We need to espace parentheses because these are registered in Angular router as secondary segments.
    // Broweser check is for SSR build. Current Node version doesn't support replaceAll function
    if (keywords?.length > 0 && this.appSettingsService.isBrowser) {
      source.keywords = keywords
        .map(
          (x) =>
            '<a href="/results/publications/' +
            x.keyword.replaceAll(/\(/g, '%28').replaceAll(/\)/g, '%29').trim() +
            '?target=keywords&page=1">' +
            x.keyword.trim() +
            '</a>'
        )
        .join('; ');
    }

    // Get authors per organization
    if (author?.length > 0) {
      author.forEach((item) => {
        item.organization.forEach((org) => {
          let authorArr = [];
          const orgUnitArr = [];
          org.organizationUnit.forEach((subUnit) => {
            subUnit.person?.forEach((person) => {
              // Add author if name is available
              if (
                (person.authorLastName + ' ' + person.authorFirstNames).trim()
                  .length > 0
              ) {
                authorArr.push({
                  author: (
                    person.authorLastName +
                    ' ' +
                    person.authorFirstNames
                  ).trim(),
                  orcid: person.Orcid?.length > 10 ? person.Orcid : false,
                  subUnit:
                    subUnit.OrgUnitId !== '-1'
                      ? [subUnit.organizationUnitNameFi]
                      : null,
                });
              }
            });
            // Add sub units under organization if no person sub units
            if (
              !subUnit.person &&
              subUnit.organizationUnitNameFi !== '-1' &&
              subUnit.organizationUnitNameFi !== ' ' &&
              subUnit.OrgUnitId !== '-1'
            ) {
              orgUnitArr.push({
                subUnit:
                  subUnit.OrgUnitId !== '-1'
                    ? [subUnit.organizationUnitNameFi]
                    : null,
              });
              // List sub unit IDs if no name available
            } else if (
              !subUnit.person &&
              subUnit.organizationUnitNameFi === ' '
            ) {
              orgUnitArr.push({
                subUnit: [subUnit.OrgUnitId],
              });
            } else if (subUnit.organizationUnitNameFi === ' ') {
              orgUnitArr.push({
                subUnit: [subUnit.OrgUnitId],
              });
            }
          });

          // Filter all authors with subUnit
          const subUnits = authorArr.filter((obj) => obj.subUnit !== null);

          // Look through all authors
          authorArr.forEach((obj) => {
            // Check if author with same name exists with subUnit
            if (
              subUnits.findIndex((withSub) => withSub.author === obj.author) < 0
            ) {
              // Add it to the list if not
              subUnits.push(obj);
            }
          });

          // Replace author list without duplicates
          authorArr = subUnits;

          // Check for duplicate authors and merge sub units
          const duplicateAuthors = Object.values(
            authorArr.reduce((c, { author, orcid, subUnit }) => {
              c[author] = c[author] || { author, orcid, subUnits: [] };
              c[author].subUnits = c[author].subUnits.concat(
                Array.isArray(subUnit) ? subUnit : [subUnit]
              );
              return c;
            }, {})
          );

          const checkedAuthors = [...new Set(duplicateAuthors)];

          // Language check
          const orgName =
            org['OrganizationName' + this.currentLocale].trim() ||
            org?.OrganizationNameEn?.trim() ||
            org?.OrganizationNameFi?.trim() ||
            org?.OrganizationNameSv?.trim();

          this.authorAndOrganization.push({
            orgName: orgName,
            orgId: org.organizationId,
            authors: checkedAuthors,
            orgUnits: orgUnitArr,
          });
        });
      });
    }

    // Remove duplicate organizations
    this.authorAndOrganization = this.authorAndOrganization.filter(
      (v, i, a) => a.findIndex((t) => t.orgName === v.orgName) === i
    );

    // Check if sub units exist
    const authors = this.authorAndOrganization
      .map((item) => item.authors)
      .flat(1);

    const subUnits = authors
      .map((item) => item.subUnits)
      .filter((item) => item[0]);

    const orgUnits = this.authorAndOrganization
      .map((item) => item.orgUnits)
      .filter((item) => item.length > 0);

    this.hasSubUnits =
      subUnits.length > 0 || orgUnits.length > 0 ? true : false;

    // RelatedQ
    this.relatedData = {
      organizations: this.authorAndOrganization.map((item) => item.orgId),
    };

    source.internationalCollaboration = source.internationalCollaboration
      ? $localize`:@@yes:Kyllä`
      : $localize`:@@no:Ei`;

    source.businessCollaboration = source.businessCollaboration
      ? $localize`:@@yes:Kyllä`
      : $localize`:@@no:Ei`;

    // Get & set publication type label
    this.publicationTypeLabel =
      this.staticDataService.publicationClass
        .find((val) => val.class === source.publicationTypeCode.slice(0, 1))
        .types.find((type) => type.type === source.publicationTypeCode)
        ?.label || source.publicationTypeCode;

    if (this.publicationTypeLabel) {
      source.publicationTypeCode =
        source.publicationTypeCode.trim() + ' ' + this.publicationTypeLabel;
    }

    if (source.doiHandle === 'http://dx.doi.org/') source.doiHandle = '';

    // Handle duplicate links
    if (source.doiHandle?.includes(source.doi)) source.doiHandle = null;

    source.selfArchivedData?.forEach((group, i) => {
      source.selfArchivedData[i].selfArchived = group.selfArchived.filter(
        (item, index, self) =>
          index ===
          self.findIndex(
            (obj: { selfArchivedAddress: any }) =>
              obj.selfArchivedAddress === item.selfArchivedAddress
          )
      );
    });

    // Handle empty self archived data
    if (
      source.selfArchivedData &&
      source.selfArchivedData[0]?.selfArchived[0].selfArchivedAddress?.trim() ===
        ''
    )
      source.selfArchivedData = null;
  }

  expandDescription() {
    this.expand = !this.expand;
  }
}
