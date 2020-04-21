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
import { map } from 'rxjs/operators';
import { SearchService } from '../../../services/search.service';
import { SettingsService } from '../../../services/settings.service';
import { TabChangeService } from '../../../services/tab-change.service';
import { StaticDataService } from '../../../services/static-data.service';
import { Subscription } from 'rxjs';
import { DOCUMENT } from '@angular/common';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { faQuoteRight } from '@fortawesome/free-solid-svg-icons';
import { HttpHeaders } from '@angular/common/http';
import { BsModalRef, BsModalService } from 'ngx-bootstrap';
import { UtilityService } from 'src/app/services/utility.service';
import { Search } from 'src/app/models/search.model';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  infoFields = [
    // {label: 'Julkaisun nimi', field: 'title'},
    {label: 'Julkaisuvuosi', field: 'publicationYear'},
    {label: 'Julkaisutyyppi', field: 'publicationTypeCode', typeLabel: ' ',
    tooltipFi: 'OKM:n julkaisutiedonkeruun mukainen julkaisutyyppi A–G.'},
    {label: 'Tekijät', field: 'authors',
    tooltipFi: 'Julkaisun tekijät siinä järjestyksessä, jossa ne on listattu alkuperäisessä julkaisussa. Jos tekijöitä on yli 20, kaikkia ei ole välttämättä ilmoitettu.'}
  ];

  authorFields = [
    {label: 'Tekijöiden määrä', field: 'author[0].nameFiSector',
    tooltipFi: 'Julkaisun tekijät, joilla on suomalainen organisaatio'}
  ];

  authorAndOrganization = [];

  organizationSubFields = [
    {label: 'Organisaatio', field: 'organizationId'}
  ];

  mediumFields = [
    {label: 'Lehti', field: 'journalName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Emojulkaisun nimi', field: 'parentPublicationTitle', link: true, linkPath: '/results/publications/'},
    {label: 'Konferenssi', field: 'conferenceName', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Kustantaja', field: 'publisher', link: true, linkPath: '/results/publications/' /*, lang: true */},
    {label: 'Volyymi', field: 'volume', link: false},
    {label: 'Numero', field: 'issueNumber', link: false},
    {label: 'Sivut', field: 'pageNumbers', link: false},
    {label: 'ISSN', field: 'issn', link: true, linkPath: '/results/publications/'},
    {label: 'ISBN', field: 'isbn', link: true, linkPath: '/results/publications/'},
    // \u00AD soft hyphen, break word here if needed
    {label: 'Julkaisu\u00ADfoorumi', field: 'jufoCode', link: true, linkPath: 'https://www.tsv.fi/julkaisufoorumi/haku.php?issn=',
    tooltipFi: 'Julkaisukanavan tunniste Julkaisufoorumissa (www.julkaisufoorumi.fi).'},
    {label: 'Julkaisu\u00ADfoorumitaso', field: 'jufoClassCode', link: false, linkPath: '/results/publications?page=1&juFo='},
  ];

  linksFields = [
    {label: 'DOI', field: 'doi', path: 'https://doi.org/'},
    {label: 'Pysyvä osoite', field: 'doiHandle'},
    {label: 'Rinnakkaistallennus', field: 'selfArchivedAddress'},
  ];

  otherFields  = [
    {label: 'Tieteenalat', field: 'fieldsParsed', tooltipFi: 'Tilastokeskuksen luokituksen mukaiset tieteenalat.'},
    {label: 'Avoin saatavuus', field: 'openAccessText',
    tooltipFi: '<p><strong>Open access -lehti: </strong>Julkaisu on ilmestynyt julkaisukanavassa, jonka kaikki julkaisut ovat avoimesti saatavilla.</p><p><strong>Rinnakkaistallennettu: </strong>Julkaisu on tallennettu organisaatio- tai tieteenalakohtaiseen julkaisuarkistoon joko välittömästi tai kustantajan määrittämän kohtuullisen embargoajan jälkeen.</p><p><strong>Muu avoin saatavuus: </strong>Julkaisu on avoimesti saatavilla, mutta se on ilmestynyt ns. hybridijulkaisukanavassa, jossa kaikki muut julkaisut eivät ole avoimesti saatavilla.</p>'},
    {label: 'Julkaisumaa', field: 'countries'},
    {label: 'Kieli', field: 'languages'},
    {label: 'Kansainvälinen yhteisjulkaisu', field: 'internationalCollaboration',
    tooltipFi: 'Kv. yhteisjulkaisussa on tekijöitä myös muualta kuin suomalaisista tutkimusorganisaatioista'},
    {label: 'Yhteisjulkaisu yrityksen kanssa', field: 'businessCollaboration',
    tooltipFi: 'Julkaisussa on tekijöitä vähintään yhdestä yrityksestä.'},
    {label: 'Avainsanat', field: 'keywords'}
  ];

  citationStyles = [
    {label: 'APA', cslStyle: 'apa'},
    {label: 'Chicago', cslStyle: 'chicago-author-date'},
    {label: 'MLA', cslStyle: 'mla'}
  ];

  documentLang = this.document.documentElement.lang;

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  juFoCode: any;

  faQuoteRight = faQuoteRight;
  faIcon = faFileAlt;
  publicationType: any;
  publicationTypeLabel: string;
  showSubUnits = false;
  hasSubUnits: boolean;

  citations = [];
  hasDoi = false;
  modalRef: BsModalRef;
  relatedData = {};

  constructor( private route: ActivatedRoute, private singleService: SingleItemService, public searchService: SearchService,
               private titleService: Title, private tabChangeService: TabChangeService, @Inject(DOCUMENT) private document: any,
               private settingsService: SettingsService, private staticDataService: StaticDataService,
               private modalService: BsModalService, public utilityService: UtilityService, @Inject(LOCALE_ID) private localeId,
               private snackBar: MatSnackBar ) {
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
    this.searchTerm = this.searchService.singleInput;
  }

  ngOnDestroy() {
    this.idSub.unsubscribe();
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
    this.snackBar.open('Viite kopioitu leikepöydälle');
  }

  getCitations() {
    const source = this.responseData.publications[0];
    const doi = this.linksFields.filter(x => x.label === 'DOI').shift();
    // tslint:disable-next-line: curly
    if (!this.hasDoi) return;
    const doiUrl = source.doi;
    const url = doi.path + doiUrl;

    this.citationStyles.forEach(style => {
      const options = {
        headers: new HttpHeaders({
          Accept: 'text/x-bibliography; style=' + style.cslStyle
        }),
        responseType: 'text'
      };
      this.searchService.getFromUrl(url, options).subscribe(res => {
        this.citations.push(res);
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
      if (this.responseData.publications) {
        switch (this.localeId) {
          case 'fi': {
            this.setTitle(this.responseData.publications[0].title + ' - Tiedejatutkimus.fi');
            break;
          }
          case 'en': {
            this.setTitle(this.responseData.publications[0].title + ' - Research.fi');
            break;
          }
        }
        this.srHeader.nativeElement.innerHTML = this.titleService.getTitle().split(' - ', 1);
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
    const checkEmpty = (item: {field: string} ) =>  {
      return this.responseData.publications[0][item.field] !== '-1' &&
             this.responseData.publications[0][item.field] !== undefined &&
             this.responseData.publications[0][item.field] !== 'undefined' &&
             this.responseData.publications[0][item.field].length !== 0 &&
             JSON.stringify(this.responseData.publications[0][item.field]) !== '["undefined"]' &&
             this.responseData.publications[0][item.field] !== ' ';
    };
    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter(item => checkEmpty(item));
    this.authorFields = this.authorFields.filter(item => checkEmpty(item));
    this.organizationSubFields = this.organizationSubFields.filter(item => checkEmpty(item));
    this.mediumFields = this.mediumFields.filter(item => checkEmpty(item));
    this.linksFields = this.linksFields.filter(item => checkEmpty(item));
    this.otherFields = this.otherFields.filter(item => checkEmpty(item));
  }

  shapeData() {
    // Capitalize first letter of locale
    const locale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
    const source = this.responseData.publications[0];
    const fieldsOfScience = source.fieldsOfScience;
    const countries = source.countries;
    const languages = source.languages;
    const keywords = source.keywords;
    const author = source.author;

    if (fieldsOfScience?.length > 0) {
      // Remove fields where ID is 0. ToDo: Recheck when document with more than one field of science is found
      for (const [i, item] of fieldsOfScience.entries()) {
        if ( item.id === 0) {
          fieldsOfScience.splice(i, 1);
        }
      }
      source.fieldsParsed = fieldsOfScience.map(x => x.nameFi.trim()).join(', ');
    }

    if (countries?.length > 0) {
      const key = 'country' + locale;
      source.countries = countries.map(x => x[key]);
    }

    if (languages?.length > 0) {
      const key = 'language' + locale;
      source.languages = languages.map(x => x[key]);
    }

    if (keywords?.length > 0) {
      source.keywords = keywords.map(x => x.keyword.trim()).join(', ');
    }

    // Get authors per organization
    if (author?.length > 0) {
      author.forEach(item => {
        item.organization.forEach(org => {
          const authorArr = [];
          const orgUnitArr = [];
          org.organizationUnit.forEach(subUnit => {
            subUnit.person?.forEach(person => {
              // Add author if name is available
              if ((person.authorLastName + ' ' + person.authorFirstNames).trim().length > 0) {
                authorArr.push({
                  author: (person.authorLastName + ' ' + person.authorFirstNames).trim(),
                  orcid: person.Orcid?.length > 10 ? person.Orcid : false,
                  subUnit: subUnit.OrgUnitId !== '-1' ? subUnit.organizationUnitNameFi : null
                });
              }
            });
            if (!subUnit.person && subUnit.organizationUnitNameFi !== '-1') {
              orgUnitArr.push({
                subUnit: subUnit.OrgUnitId !== '-1' ? subUnit.organizationUnitNameFi : null
              });
            }
          });
          this.authorAndOrganization.push({orgName: org.OrganizationNameFi.trim(), orgId: org.organizationId,
            authors: authorArr, orgUnits: orgUnitArr});
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

    source.internationalCollaboration = source.internationalCollaboration ? 'Kyllä' : 'Ei';
    source.businessCollaboration = source.businessCollaboration ? 'Kyllä' : 'Ei';

    // Get & set publication type label
    this.publicationType = this.staticDataService.publicationClass.find(val => val.class === source.publicationTypeCode.slice(0, 1));
    this.publicationTypeLabel = this.publicationType.label;
  }

  navigate(field) {
    this.settingsService.strictFields(field);
  }
}
