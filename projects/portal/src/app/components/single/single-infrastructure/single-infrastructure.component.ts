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
  LOCALE_ID,
  Inject,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { SingleItemService } from '@portal.services/single-item.service';
import { SearchService } from '@portal.services/search.service';
import { Title } from '@angular/platform-browser';
import { faFileAlt } from '@fortawesome/free-regular-svg-icons';
import { Subscription } from 'rxjs';
import { Search } from '@portal.models/search.model';
import { TabChangeService } from '@portal.services/tab-change.service';
import { UtilityService } from '@portal.services/utility.service';
import {
  singleInfrastructure,
  common,
} from '@portal.assets/static-data/meta-tags.json';
import { SettingsService } from '@portal.services/settings.service';

@Component({
  selector: 'app-single-infrastructure',
  templateUrl: './single-infrastructure.component.html',
  styleUrls: ['./single-infrastructure.component.scss'],
})
export class SingleInfrastructureComponent implements OnInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  stringHasContent = UtilityService.stringHasContent;
  private metaTags = singleInfrastructure;
  private commonTags = common;

  tab = 'infrastructures';
  infoFields = [
    {
      label: $localize`:@@infraAcronym:Lyhenne`,
      field: 'acronym',
      tooltip: $localize`:@@acronymTooltip:Tutkimusinfrastruktuurin lyhenne. Infrastruktuureille on tyypillistä, että ne tunnetaan lyhenteellään.`,
    },
    {
      label: $localize`:@@infraDescription:Infrastruktuurin kuvaus`,
      field: 'description',
      tooltip: $localize`:@@infraDescriptionTooltip:Kuvaus kertoo yleisesti tutkimusinfrastruktuurista.`,
    },
    {
      label: $localize`:@@scientificDescription:Tieteellinen kuvaus`,
      field: 'scientificDescription',
      tooltip: $localize`:@@scientificDescriptionTooltip:Kertoo tutkimusinfrastruktuurin tieteellisistä sovelluskohteista ja käyttötarkoituksista.`,
    },
    {
      label: $localize`:@@infraStartYear:Toiminta alkanut`,
      field: 'startYear',
      tooltip: $localize`:@@infraStartYearTooltip:Koko tutkimusinfrastruktuurin käyttöönottovuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta, jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun`,
    },
    { label: $localize`:@@infraEndYear:Toiminta päättynyt`, field: 'endYear' },
    {
      label: $localize`:@@responsibleOrganization:Vastuuorganisaatio`,
      field: 'responsibleOrganization',
      tooltip: $localize`:@@responsibleOrganizationTooltip:Tutkimusinfrastruktuurin kotiorganisaatio, joka vastaa siitä kokonaisuudessaan. Infrastruktuureilla voi olla myös muita organisaatioita, jotka vastaavat joistain palveluista.`,
    },
    {
      label: $localize`:@@participatingOrgs:Osallistuvat organisaatiot`,
      field: 'participantOrganizations',
    },
    {
      label: $localize`:@@keywords:Avainsanat`,
      field: 'keywordsString',
      tooltip: $localize`:@@infraKeywordsTooltip:Tutkimusinfrastruktuuria, sen palveluita ja toimintaa kuvailevia avainsanoja.`,
    },
  ];

  serviceFields = [
    {
      label: $localize`:@@serviceDescription:Palvelun kuvaus`,
      field: 'description',
      tooltip: $localize`:@@serviceDescriptionTooltip:Palvelun tarkempi kuvaus`,
    },
    {
      label: $localize`:@@scientificDescription:Tieteellinen kuvaus`,
      field: 'scientificDescription',
    },
    {
      label: $localize`:@@serviceType:Palvelun tyyppi`,
      field: 'type',
      tooltip: $localize`:@@serviceTypeTooltip:Tutkimusinfrastruktuurien palvelut jaetaan kolmeen eri tyyppiin: aineistoon, laitteistoon tai palveluun. Valittu tyyppi kuvaa parhaiten palvelua.`,
    },
  ];

  servicePointContactFields = [
    { label: $localize`Kuvaus`, field: 'description' },
    { label: $localize`Sähköpostiosoite`, field: 'emailAddress' },
    { label: $localize`Puhelinnumero`, field: 'phoneNumber' },
    { label: $localize`Vierailuosoite`, field: 'visitingAddress' },
  ];

  servicePointInfoFields = [
    { label: $localize`Käyttöehdot`, field: 'accessPolicyUrl' },
    { label: $localize`Linkki`, field: 'infoUrl' },
    { label: $localize`Koordinoiva organisaatio`, field: 'coOrg' },
  ];

  fieldsOfScience = [
    {
      label: $localize`:@@fieldsOfScience:Tieteenalat`,
      field: 'fieldsOfScienceString',
    },
  ];

  classificationFields = [
    {
      label: $localize`Suomen Akatemian tiekartalla`,
      field: 'finlandRoadmap',
      tooltip: $localize`:@@finlandRoadmapTooltip:Tutkimusinfrastruktuuri on voimassaolevalla Suomen Akatemian tiekartalla.`,
    },
    { label: $localize`ESFRI-luokitus`, field: 'ESFRICode' },
    { label: $localize`MERIL-luokitus`, field: 'merilCode' },
  ];

  contactFields = [
    { label: $localize`Nimi`, field: 'contactName' },
    { label: $localize`Kuvaus`, field: 'contactDescription' },
    { label: $localize`Sähköpostiosoite`, field: 'email' },
    { label: $localize`Puhelinnumero`, field: 'phoneNumber' },
    { label: $localize`Vierailuosoite`, field: 'address' },
  ];

  otherFields = [
    { label: $localize`Tunnisteet`, field: 'urn' },
    { label: $localize`Osa kansainvälistä infrastruktuuria`, field: '?' },
    {
      label: $localize`Edeltävä tutkimusinfrastruktuuri`,
      field: 'replacingInfrastructure',
    },
    { label: $localize`Lisätietoja`, field: '?' },
  ];

  linkFields = [{ field: 'homepage' }];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  idSub: Subscription;
  infoExpand: boolean[] = [];
  serviceExpand: boolean[] = [];
  showService: boolean[] = [];
  showServicePoint: boolean[][] = [];
  faIcon = faFileAlt;
  tabData: any;
  currentLocale: string;
  serviceHeader = $localize`:@@infraServiceHeader:Palvelu`;
  showMore = $localize`:@@showMore:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;
  relatedData: {};

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    private titleService: Title,
    private tabChangeService: TabChangeService,
    @Inject(LOCALE_ID) protected localeId: string,
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
    this.idSub = this.singleService.currentId.subscribe((id) =>
      this.getData(id)
    );
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.infrastructures;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'infrastructures'
    );
    this.searchTerm = this.searchService.searchTerm;
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.singleService.getSingleInfrastructure(id).subscribe(
      (responseData) => {
        this.responseData = responseData;
        if (this.responseData.infrastructures[0]) {
          switch (this.localeId) {
            case 'fi': {
              this.setTitle(
                this.responseData.infrastructures[0].name +
                  ' - Tiedejatutkimus.fi'
              );
              break;
            }
            case 'en': {
              this.setTitle(
                this.responseData.infrastructures[0].name + ' - Research.fi'
              ); // English name??
              break;
            }
            case 'sv': {
              this.setTitle(
                this.responseData.infrastructures[0].name + ' - Forskning.fi'
              ); // English name??
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
        this.responseData.infrastructures[0][item.field]
      );
    };

    // Filter all the fields to only include properties with defined data
    this.infoFields = this.infoFields.filter((item) => checkEmpty(item));
    this.fieldsOfScience = this.fieldsOfScience.filter((item) =>
      checkEmpty(item)
    );
    this.classificationFields = this.classificationFields.filter((item) =>
      checkEmpty(item)
    );
    this.contactFields = this.contactFields.filter((item) => checkEmpty(item));
    this.otherFields = this.otherFields.filter((item) => checkEmpty(item));
    this.linkFields = this.linkFields.filter((item) => checkEmpty(item));

    // Init expand and show lists
    this.infoFields.forEach((_) => this.infoExpand.push(false));
    this.serviceFields.forEach((_) => this.serviceExpand.push(false));
    this.responseData.infrastructures[0].services.forEach((service, idx) => {
      this.showService.push(false);
      this.showServicePoint.push([]);
      service.servicePoints.forEach((_) =>
        this.showServicePoint[idx].push(false)
      );
    });
  }

  shapeData() {
    const source = this.responseData.infrastructures[0];
    source.finlandRoadmap = source.finlandRoadmap
      ? $localize`:@@yes:Kyllä`
      : $localize`:@@no:Ei`;

    // Filter out empty servicepoints and empty services
    source.services.forEach((service, idx) => {
      source.services[
        idx
      ].servicePoints = service.servicePoints
        .map((servicePoint) =>
          UtilityService.objectHasContent(servicePoint)
            ? servicePoint
            : undefined
        )
        .filter((x) => x);
    });

    source.services = source.services
      .map((service) =>
        UtilityService.objectHasContent(service) ? service : undefined
      )
      .filter((x) => x);

    // Related data
    this.relatedData = {
      organizations: [source.responsibleOrganizationId],
    };
  }

  checkOverflow(elem: HTMLElement) {
    return elem.scrollHeight > elem.clientHeight;
  }

  expandInfoDescription(idx: number) {
    this.infoExpand[idx] = !this.infoExpand[idx];
  }

  expandServiceDescription(idx: number) {
    this.serviceExpand[idx] = !this.serviceExpand[idx];
  }

  toggleService(idx: number) {
    this.showService[idx] = !this.showService[idx];
  }

  toggleServicePoint(service: number, point: number) {
    this.showServicePoint[service][point] = !this.showServicePoint[service][
      point
    ];
  }

  serviceExpandId(serviceId: number, fieldId: number) {
    return this.serviceFields.length * serviceId + fieldId;
  }
}
