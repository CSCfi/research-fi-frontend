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
  DOCUMENT, QueryList, ViewChildren, AfterViewInit, inject
} from '@angular/core';
import { NgIf, NgFor, NgClass, NgSwitch, ViewportScroller } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { Subscription } from 'rxjs';
import { Search } from 'src/app/portal/models/search.model';
import { TabChangeService } from 'src/app/portal/services/tab-change.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import MetaTags from 'src/assets/static-data/meta-tags.json';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { ShareComponent } from '../share/share.component';
import { RelatedLinksComponent } from '../related-links/related-links.component';
import { SingleResultLinkComponent } from '../single-result-link/single-result-link.component';
import { MatCard, MatCardTitle } from '@angular/material/card';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import { BreadcrumbComponent } from '../../breadcrumb/breadcrumb.component';
import { SearchBarComponent } from '../../search-bar/search-bar.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-single-infrastructure',
  templateUrl: './single-infrastructure.component.html',
  styleUrls: ['./single-infrastructure.component.scss'],
  imports: [
    SearchBarComponent,
    NgIf,
    RouterLink,
    BreadcrumbComponent,
    NgFor,
    TooltipModule,
    NgClass,
    NgSwitch,
    MatCard,
    MatCardTitle,
    SingleResultLinkComponent,
    RelatedLinksComponent,
    ShareComponent,
    SvgSpritesComponent,
  ]
})
export class SingleInfrastructureComponent implements OnInit, AfterViewInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  stringHasContent = UtilityService.stringHasContent;
  private metaTags = MetaTags.singleInfrastructure;
  private commonTags = MetaTags.common;
  viewportScroller = inject(ViewportScroller);

  tab = 'infrastructures';
  infoFields = [
    {
      label: $localize`:@@infraAcronym:Lyhenne`,
      field: 'acronym',
      tooltip: $localize`:@@acronymTooltip:Tutkimusinfrastruktuurin lyhenne. Infrastruktuureille on tyypillistä, että ne tunnetaan lyhenteellään.`
    },
    {
      label: $localize`:@@infraDescription:Infrastruktuurin kuvaus`,
      field: 'description',
      tooltip: $localize`:@@infraDescriptionTooltip:Kuvaus kertoo yleisesti tutkimusinfrastruktuurista.`
    },
    {
      label: $localize`:@@scientificDescription:Tieteellinen kuvaus`,
      field: 'scientificDescription',
      tooltip: $localize`:@@scientificDescriptionTooltip:Kertoo tutkimusinfrastruktuurin tieteellisistä sovelluskohteista ja käyttötarkoituksista.`
    },
    {
      label: $localize`:@@infraStartYear:Toiminta alkanut`,
      field: 'startYear',
      tooltip: $localize`:@@infraStartYearTooltip:Koko tutkimusinfrastruktuurin käyttöönottovuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta, jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun`
    },
    { label: $localize`:@@infraEndYear:Toiminta päättynyt`, field: 'endYear' },
    {
      label: $localize`:@@responsibleOrganization:Vastuuorganisaatio`,
      field: 'responsibleOrganization',
      tooltip: $localize`:@@responsibleOrganizationTooltip:Tutkimusinfrastruktuurin kotiorganisaatio, joka vastaa siitä kokonaisuudessaan. Infrastruktuureilla voi olla myös muita organisaatioita, jotka vastaavat joistain palveluista.`
    },
    {
      label: $localize`:@@participatingOrgs:Osallistuvat organisaatiot`,
      field: 'participantOrganizations'
    },
    {
      label: $localize`:@@keywords:Avainsanat`,
      field: 'keywordsString',
      tooltip: $localize`:@@infraKeywordsTooltip:Tutkimusinfrastruktuuria, sen palveluita ja toimintaa kuvailevia avainsanoja.`
    }
  ];

  serviceFields = [
    {
      label: $localize`:@@serviceDescription:Palvelun kuvaus`,
      field: 'description',
      tooltip: $localize`:@@serviceDescriptionTooltip:Palvelun tarkempi kuvaus`
    },
    {
      label: $localize`:@@scientificDescription:Tieteellinen kuvaus`,
      field: 'scientificDescription'
    },
    {
      label: $localize`:@@serviceType:Palvelun tyyppi`,
      field: 'type',
      tooltip: $localize`:@@serviceTypeTooltip:Tutkimusinfrastruktuurien palvelut jaetaan kolmeen eri tyyppiin: aineistoon, laitteistoon tai palveluun. Valittu tyyppi kuvaa parhaiten palvelua.`
    }
  ];

  servicePointContactFields = [
    { label: $localize`Kuvaus`, field: 'description' },
    { label: $localize`Sähköpostiosoite`, field: 'emailAddress' },
    { label: $localize`Puhelinnumero`, field: 'phoneNumber' },
    { label: $localize`Vierailuosoite`, field: 'visitingAddress' }
  ];

  servicePointInfoFields = [
    { label: $localize`Käyttöehdot`, field: 'accessPolicyUrl' },
    { label: $localize`Linkki`, field: 'infoUrl' },
    { label: $localize`Koordinoiva organisaatio`, field: 'coOrg' }
  ];

  fieldsOfScience = [
    {
      label: $localize`:@@fieldsOfScience:Tieteenalat`,
      field: 'fieldsOfScienceString'
    }
  ];

  classificationFields = [
    {
      label: $localize`Suomen Akatemian tiekartalla`,
      field: 'finlandRoadmap',
      tooltip: $localize`:@@finlandRoadmapTooltip:Tutkimusinfrastruktuuri on voimassaolevalla Suomen Akatemian tiekartalla.`
    },
    { label: $localize`ESFRI-luokitus`, field: 'ESFRICode' },
    { label: $localize`MERIL-luokitus`, field: 'merilCode' }
  ];

  contactFields = [
    { label: $localize`Nimi`, field: 'contactName' },
    { label: $localize`Kuvaus`, field: 'contactDescription' },
    { label: $localize`Sähköpostiosoite`, field: 'email' },
    { label: $localize`Puhelinnumero`, field: 'phoneNumber' },
    { label: $localize`Vierailuosoite`, field: 'address' }
  ];

  otherFields = [
    { label: $localize`Tunnisteet`, field: 'urn' },
    { label: $localize`Osa kansainvälistä infrastruktuuria`, field: '?' },
    {
      label: $localize`Edeltävä tutkimusinfrastruktuuri`,
      field: 'replacingInfrastructure'
    },
    { label: $localize`Lisätietoja`, field: '?' }
  ];

  linkFields = [{ field: 'homepage' }];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  @ViewChildren('servicesRefs') private servicesRefs: QueryList<ElementRef>;

  idSub: Subscription;
  servicesRefsSub: Subscription;
  infoExpand: boolean[] = [];
  serviceExpand: boolean[] = [];
  showService: boolean[] = [];
  showServicePoint: boolean[][] = [];
  tabData: any;
  currentLocale: string;
  serviceHeader = $localize`:@@infraServiceHeader:Palvelu`;
  showMore = $localize`:@@showMoreFilters:Näytä enemmän`;
  showLess = $localize`:@@showLess:Näytä vähemmän`;
  relatedData: {};
  focusSub: Subscription;
  dataSub: Subscription;
  private selectedServiceUrn: string;
  private positionInitialized = false;
  private selectedServiceIndex: number = undefined;

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    private tabChangeService: TabChangeService,
    @Inject(LOCALE_ID) protected localeId: string,
    public utilityService: UtilityService,
    private settingsService: SettingsService,
    @Inject(DOCUMENT) private document: any,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe((id) =>
      this.getData(id)
    );
    this.route.queryParamMap.subscribe(params => {
      this.selectedServiceUrn = params.get('service');
    });
    this.singleId = this.route.snapshot.params.id;
    this.singleService.updateId(this.singleId);
    this.pageNumber = this.searchService.pageNumber || 1;
    this.tabQueryParams = this.tabChangeService.tabQueryParams.infrastructures;
    this.tabData = this.tabChangeService.tabData.find(
      (item) => item.data === 'infrastructures'
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
    this.servicesRefsSub = this.servicesRefs.changes.subscribe(() => {
      if (!this.positionInitialized && this.selectedServiceIndex !== undefined) {
        const elTopPosition = this.servicesRefs.get(this.selectedServiceIndex).nativeElement.getBoundingClientRect().top;
        this.viewportScroller.scrollToPosition([0, elTopPosition]);
        //this.servicesRefs.get(1).nativeElement.click();
        this.positionInitialized = true;
      }
    });
  }

  ngOnDestroy() {
    this.idSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.dataSub?.unsubscribe();
    this.servicesRefsSub?.unsubscribe();
    this.settingsService.related = false;
  }

  getData(id: string) {
    this.dataSub = this.singleService.getSingleInfrastructure(id).subscribe({
      next: (responseData) => {
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
      error: (error) => (this.errorMessage = error as any)
    });
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
      source.services[idx].servicePoints = service.servicePoints
        .map((servicePoint) =>
          UtilityService.objectHasContent(servicePoint)
            ? servicePoint
            : undefined
        )
        .filter((x) => x);
    });

    let openedInd = 0;

    source.services = source.services
      .map((service) =>
        {
          if (service.urn?.length > 11) {
            if (service.urn.substring(11, service.urn.length) === this.selectedServiceUrn) {
              this.showService[openedInd] = true;
              this.selectedServiceIndex = openedInd;
            }
          }
          openedInd += 1;
          return UtilityService.objectHasContent(service) ? service : undefined
        }
      )
      .filter((x) => x);

    // Related data
    this.relatedData = {
      organizations: [source.responsibleOrganizationId]
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
    this.showServicePoint[service][point] =
      !this.showServicePoint[service][point];
  }

  serviceExpandId(serviceId: number, fieldId: number) {
    return this.serviceFields.length * serviceId + fieldId;
  }

  showEmail(event, address) {
    const span = this.document.createElement('span');
    span.innerHTML = address;
    event.target.replaceWith(span);
  }
}
