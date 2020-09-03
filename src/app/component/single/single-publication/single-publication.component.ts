//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, ElementRef, ViewChild, OnDestroy, Inject, TemplateRef, LOCALE_ID } from '@angular/core';
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
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';
import { Search } from 'src/app/models/search.model';
import { MatSnackBar } from '@angular/material/snack-bar';
import { singlePublication, common } from 'src/assets/static-data/meta-tags.json';

@Component({
  selector: 'app-single-publication',
  templateUrl: './single-publication.component.html',
  styleUrls: ['./single-publication.component.scss']
})
export class SinglePublicationComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tab = 'publications';
  tabQueryParams: any;
  private metaTags = singlePublication;
  private commonTags = common;


  infoFields = [
    // {label: 'Julkaisun nimi', field: 'title'},
    {label: $localize`:@@yearOfPublication:Julkaisuvuosi`, field: 'publicationYear'},
    {label: $localize`:@@publicationType:Julkaisutyyppi`, field: 'publicationTypeCode', typeLabel: ' ',
    tooltip: $localize`:@@publicationTypeTooltip:OKM:n julkaisutiedonkeruun mukainen julkaisutyyppi A–G.`},
    {label: $localize`:@@publicationAuthors:Tekijät`, field: 'authors',
    tooltip: $localize`:@@publicationAuthorsTooltip:Julkaisun tekijät siinä järjestyksessä, jossa ne on listattu alkuperäisessä julkaisussa. Jos tekijöitä on yli 20, kaikkia ei ole välttämättä ilmoitettu.`}
  ];

  // authorFields = [
  //   {label: 'Tekijöiden määrä', labelSv: '', labelEn: '', field: 'author[0].nameFiSector',
  //   tooltip: 'Julkaisun tekijät, joilla on suomalainen organisaatio', tooltipSv: '', tooltipEn: ''}
  // ];

  authorAndOrganization = [];

  organizationSubFields = [
    {label: $localize`:@@orgOrganization:Organisaatio`, field: 'organizationId'}
  ];

  mediumFields = [
    {label: $localize`Lehti`, field: 'journalName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: $localize`Emojulkaisun nimi`, field: 'parentPublicationName', link: true, linkPath: '/results/publications/'},
    {label: $localize`:@@parentPublicationPublisher:Emojulkaisun toimittajat`, field: 'parentPublicationPublisher', link: false, linkPath: '/results/publications/'},
    {label: $localize`Konferenssi`, field: 'conferenceName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: $localize`Kustantaja`, field: 'publisherName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: $localize`Volyymi`, field: 'volume', link: false},
    {label: $localize`Numero`, field: 'issueNumber', link: false},
    {label: $localize`Sivut`, field: 'pageNumbers', link: false},
    {label: 'ISSN', field: 'issn', link: true, linkPath: '/results/publications/'},
    {label: 'ISBN', field: 'isbn', link: true, linkPath: '/results/publications/'},
    // \u00AD soft hyphen, break word here if needed
    {label: $localize`Julkaisu\u00ADfoorumi`, field: 'jufoCode', link: true, linkPath: 'https://www.tsv.fi/julkaisufoorumi/haku.php?issn=',
    tooltip: $localize`Julkaisukanavan tunniste Julkaisufoorumissa (www.julkaisufoorumi.fi).`},
    {label: $localize`:@@jufoLevel:Julkaisufoorumitaso`, field: 'jufoClassCode', link: false, linkPath: '/results/publications?page=1&juFo='},
  ];

  linksFields = [
    {label: 'DOI', field: 'doi', path: 'https://doi.org/'},
    {label: '', field: 'doiHandle'},
    // {label: '', field: 'selfArchivedAddress'},
  ];

  otherFields  = [
    {label: $localize`:@@fieldsOfScience:Tieteenalat`, field: 'fieldsOfScienceString', tooltip: $localize`:@@TKFOS:Tilastokeskuksen luokituksen mukaiset tieteenalat.`},
    {label: $localize`:@@openAccess:Avoin saatavuus`, field: 'openAccessText',
    tooltip: '<p><strong>' +  $localize`:@@openAccessJournal:Open access -lehti` + ': </strong>' + $localize`Julkaisu on ilmestynyt julkaisukanavassa, jonka kaikki julkaisut ovat avoimesti saatavilla.` + '</p><p><strong>' + $localize`:@@selfArchived:Rinnakkaistallennettu` + ': </strong>' + $localize`Julkaisu on tallennettu organisaatio- tai tieteenalakohtaiseen julkaisuarkistoon joko välittömästi tai kustantajan määrittämän kohtuullisen embargoajan jälkeen.` + '</p><p><strong>' + $localize`:@@otherOpenAccess:Muu avoin saatavuus` + ': </strong>' + $localize`Julkaisu on avoimesti saatavilla, mutta se on ilmestynyt ns. hybridijulkaisukanavassa, jossa kaikki muut julkaisut eivät ole avoimesti saatavilla.` + '</p>'},
    {label: $localize`:@@publicationCountry:Julkaisumaa`, field: 'countries'},
    {label: $localize`:@@language:Kieli`, field: 'languages'},
    {label: $localize`:@@intCoPublication:Kansainvälinen yhteisjulkaisu`, field: 'internationalCollaboration',
    tooltip: $localize`:@@intCoPublicationAuthors:Kv. yhteisjulkaisussa on tekijöitä myös muualta kuin suomalaisista tutkimusorganisaatioista`},
    {label: $localize`:@@publicationWithCompany:Yhteisjulkaisu yrityksen kanssa`, field: 'businessCollaboration',
    tooltip: $localize`:@@publicationCompanyAuthors:Julkaisussa on tekijöitä vähintään yhdestä yrityksestä.`},
    {label: $localize`:@@keywords:Avainsanat`, field: 'keywords'}
  ];

  citationStyles = [
    {label: 'APA', cslStyle: 'apa'},
    {label: 'Chicago', cslStyle: 'chicago-author-date'},
    {label: 'MLA', cslStyle: 'mla'}
  ];

  copyToClipboard = $localize`:@@copyToClipboard:Kopioi leikepöydälle`;
  copyReferences = $localize`:@@copyReferences:Kopioi viitetiedot`;

  documentLang = this.document.documentElement.lang;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  juFoCode: any;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;
  faCopy = faCopy;
  publicationType: any;
  publicationTypeLabel: string;
  showSubUnits = false;
  hasSubUnits: boolean;

  citations = [];
  hasDoi = false;
  modalRef: BsModalRef;
  relatedData = {};
  currentLocale: any;
  tabData: any;

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, public searchService: SearchService,
               private titleService: Title, private tabChangeService: TabChangeService, @Inject(DOCUMENT) private document: any,
               private staticDataService: StaticDataService, private modalService: BsModalService, public utilityService: UtilityService,
               @Inject(LOCALE_ID) private localeId, private snackBar: MatSnackBar, private settingsService: SettingsService) {
                // Capitalize first letter of locale
                this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
   }

  public setTitle(newTitle: string) {
    this.titleService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.route.params.subscribe(params => {
      this.getData(params.id);
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.publications;
    this.tabData = this.tabChangeService.tabData.find(item => item.data === 'publications');
    this.searchTerm = this.searchService.searchTerm;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.settingsService.related = false;
  }

  openModal(template: TemplateRef<any>) {
    // Get the citations if they aren't loaded yet
    if (this.citations.length < this.citationStyles.length) {
      this.getCitations();
    }
    this.modalRef = this.modalService.show(template, { class: 'modal-lg' });
  }

  closeModal() {
    this.modalRef.hide();
  }

  openSnackBar() {
    this.snackBar.open($localize`:@@referCopied:Viite kopioitu leikepöydälle`);
  }

  getCitations() {
    const source = this.responseData.publications[0];
    const doi = this.linksFields.filter(x => x.label === 'DOI').shift();
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
          Accept: 'text/x-bibliography; style=' + style.cslStyle
        }),
        responseType: 'text'
      };
      this.searchService.getFromUrl(url, options).subscribe(res => {
        this.citations[idx] = res;
      });
    });
  }

  getData(id: string) {
    this.singleService.getSinglePublication(id)
    // .pipe(map(responseData => [responseData]))
    .subscribe(responseData => {
      this.responseData = responseData;

      // Reset authors & organizations on new result
      this.authorAndOrganization = [];
      if (this.responseData.publications[0]) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.publications[0].title + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.publications[0].title + ' - Research.fi');
            break;
          }
          case 'sv': {
            this.setTitle(this.responseData.publications[0].title + ' - Forskning.fi');
            break;
          }
        }
        const titleString = this.titleService.getTitle();
        this.srHeader.nativeElement.innerHTML = titleString.split(' - ', 1);
        this.utilityService.addMeta(titleString,
          this.metaTags['description' + this.currentLocale], this.commonTags['imgAlt' + this.currentLocale])
        // juFoCode is used for exact search
        this.juFoCode = this.responseData.publications[0].jufoCode;
        this.shapeData();
        this.filterData();
        this.checkDoi();
      }
    },
      error => this.errorMessage = error as any);
  }

  checkDoi() {
    // Check if the doi exists (the field is filtered on init if it doesn't)
    const doi = this.linksFields.filter(x => x.label === 'DOI').shift();
    // Flag needed for template
    this.hasDoi = !!doi;
  }

  filterData() {
    // Helper function to check if the field exists and has data
    const checkEmpty = (item: {field: string} ) => {
      return UtilityService.stringHasContent(this.responseData.publications[0][item.field]);
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    // this.authorFields = this.authorFields.filter(item => checkEmpty(item));
    this.organizationSubFields = this.organizationSubFields.filter(item => checkEmpty(item));
    this.mediumFields = this.mediumFields.filter(item => checkEmpty(item));
    this.linksFields = this.linksFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    // Capitalize first letter of locale
    const locale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    const source = this.responseData.publications[0];
    const countries = source.countries;
    const languages = source.languages;
    const keywords = source.keywords;
    const author = source.author;

    if (countries?.length > 0) {
      const key = 'country' + locale;
      source.countries = countries.map(x => x[key]);
    }

    if (languages?.length > 0) {
      const key = 'language' + locale;
      source.languages = languages.map(x => x[key]);
    }

    // Link with targeted search for keywords
    if (keywords?.length > 0) {
      source.keywords = keywords.map(x =>
        '<a href="/results/publications/' + x.keyword.trim() + '?target=keywords&page=1">'+ x.keyword.trim() +'</a>').join(', ');
    }

    // Get authors per organization
    if (author?.length > 0) {
      author.forEach(item => {
        item.organization.forEach(org => {
          let authorArr = [];
          const orgUnitArr = [];
          org.organizationUnit.forEach(subUnit => {
            subUnit.person?.forEach(person => {
              // Add author if name is available
              if ((person.authorLastName + ' ' + person.authorFirstNames).trim().length > 0) {
                authorArr.push({
                  author: (person.authorLastName + ' ' + person.authorFirstNames).trim(),
                  orcid: person.Orcid?.length > 10 ? person.Orcid : false,
                  subUnit: subUnit.OrgUnitId !== '-1' ? [subUnit.organizationUnitNameFi] : null
                });
              }
            });
            // Add sub units under organization if no person sub units
            if (!subUnit.person && subUnit.organizationUnitNameFi !== '-1' && subUnit.organizationUnitNameFi !== ' '
            && subUnit.OrgUnitId !== '-1') {
              orgUnitArr.push({
                subUnit: subUnit.OrgUnitId !== '-1' ? [subUnit.organizationUnitNameFi] : null
              });
              // List sub unit IDs if no name available
            } else if (!subUnit.person && subUnit.organizationUnitNameFi === ' ') {
              orgUnitArr.push({
                subUnit: [subUnit.OrgUnitId]
              });
            } else if (subUnit.organizationUnitNameFi === ' ') {
              orgUnitArr.push({
                subUnit: [subUnit.OrgUnitId]
              });
            }
          });

          // Filter all authors with subUnit
          const subUnits = authorArr.filter(obj => obj.subUnit !== null);

          // Look through all authors
          authorArr.forEach(obj => {
            // Check if author with same name exists with subUnit
            if (subUnits.findIndex(withSub => withSub.author === obj.author) < 0) {
              // Add it to the list if not
              subUnits.push(obj);
            }
          });

          // Replace author list without duplicates
          authorArr = subUnits;

          // Check for duplicate authors and merge sub units
          const duplicateAuthors = Object.values(authorArr.reduce((c, {author, orcid, subUnit}) => {
            c[author] = c[author] || {author, orcid, subUnits: []};
            c[author].subUnits = c[author].subUnits.concat(Array.isArray(subUnit) ? subUnit : [subUnit]);
            return c;
          }, {}));

          const checkedAuthors = [...new Set(duplicateAuthors)];

          // Language check
          const orgName = org['OrganizationName' + this.currentLocale].trim() || org?.OrganizationNameEn?.trim() || org?.OrganizationNameFi?.trim() || org?.OrganizationNameSv?.trim();

          this.authorAndOrganization.push({orgName: orgName, orgId: org.organizationId,
            authors: checkedAuthors, orgUnits: orgUnitArr});
        });
      });

      // Default subUnits checks to false and check if any authors or organizations have sub units. Show button if sub units
      this.hasSubUnits = false;
      const combinedSubUnits = [...this.authorAndOrganization[0].authors, ...this.authorAndOrganization[0].orgUnits];
      this.hasSubUnits = combinedSubUnits.find(item => item.subUnit !== null) ? true : false;

      this.relatedData = {
          organizations: this.authorAndOrganization.map(item => item.orgId)
      };
    }

    // Remove duplicate organizations
    this.authorAndOrganization = this.authorAndOrganization.filter((v, i, a) =>
                                 a.findIndex(t => (t.orgName === v.orgName)) === i);

    // Is this needed anymore?
    let yes = '';
    let no = '';
    switch (this.localeId) {
      case 'en': {
        yes = 'Yes';
        no = 'No';
        break;
      }
      case 'sv': {
        yes = 'Ja';
        no = 'Nej';
        break;
      }
      default: {
        yes = 'Kyllä';
        no = 'Ei';
      }
    }

    source.internationalCollaboration = source.internationalCollaboration ? yes : no;
    source.businessCollaboration = source.businessCollaboration ? yes : no;

    // Get & set publication type label
    this.publicationTypeLabel = this.staticDataService.publicationClass.find
      (val => val.class === source.publicationTypeCode.slice(0, 1)).types.find
      (type => type.type === source.publicationTypeCode)?.label || source.publicationTypeCode;

    // tslint:disable-next-line: curly
    if (source.doiHandle === 'http://dx.doi.org/') source.doiHandle = '';
  }

}
