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
  DOCUMENT, QueryList, ViewChildren, AfterViewInit, inject, viewChild, viewChildren, computed, afterRenderEffect, ChangeDetectionStrategy
} from '@angular/core';
import { NgIf, NgFor, NgClass, NgSwitch, ViewportScroller, AsyncPipe, JsonPipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { SingleItemService } from '../../../services/single-item.service';
import { SearchService } from '../../../services/search.service';
import { BehaviorSubject, Subscription } from 'rxjs';
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
import {
  SingleInfrastructureRenewedComponent
} from '../../../../single-infrastructure-renewed/single-infrastructure-renewed.component';
import { InfraAccordionComponent, InfraService } from '../../../../infra-accordion/infra-accordion.component';
import { InfraTreeComponent } from '../../../../infra-tree/infra-tree.component';
import { VisComponent } from '../../../../vis-component/vis-component';
import {
  PrimaryActionButtonComponent
} from '@shared/components/buttons/primary-action-button/primary-action-button.component';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { HandleInfrastructureLinkPipe } from '@portal/pipes/handle-infrastructure-link.pipe';
import { HighlightSearchPipe } from '@portal/pipes/highlight.pipe';
import { MatDialog } from '@angular/material/dialog';
import {
  Combobox,
  ComboboxInput,
  ComboboxPopup,
  ComboboxPopupContainer,
} from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { cloneDeep, toInteger } from 'lodash-es';

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
    SingleInfrastructureRenewedComponent,
    InfraAccordionComponent,
    InfraTreeComponent,
    VisComponent,
    PrimaryActionButtonComponent,
    DialogComponent,
    AsyncPipe,
    JsonPipe,
    HandleInfrastructureLinkPipe,
    HighlightSearchPipe,
    Combobox,
    ComboboxInput,
    ComboboxPopup,
    ComboboxPopupContainer,
    Listbox,
    Option,
    OverlayModule,
  ]
})
export class SingleInfrastructureComponent implements OnInit, AfterViewInit, OnDestroy {
  public singleId: any;
  responseData: Search;
  infraNetworkResponseData: any;
  modalInfraData: Search;
  searchTerm: string;
  pageNumber: any;
  tabQueryParams: any;
  stringHasContent = UtilityService.stringHasContent;
  private metaTags = MetaTags.singleInfrastructure;
  private commonTags = MetaTags.common;
  viewportScroller = inject(ViewportScroller);

  isPartOfDropdownVisible = false;
  hasPartDropdownVisible = false;

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

  modalInfoFielLabels = {'acronym': $localize`:@@infraAcronymAndName:Lyhenne ja nimi`, 'startYear': $localize`:@infraStartYear:Toiminta alkanut`, 'description': $localize`:@@infraDescription:Infrastruktuurin kuvaus`, 'relationToOtherInfras': $localize`:@@relationToOtherInfras:Yhteydet muihin infrastruktuureihin`};

  modalInfoFields = [
    {
      label: $localize`:@@infraAcronymAndName:Lyhenne ja nimi`,
      field: 'acronym',
    },
    {
      label: $localize`:@@Name:Nimi`,
      field: 'name',
    },
    {
      label: $localize`:@@infraStartYear:Toiminta alkanut`,
      field: 'startYear',
      tooltip: $localize`:@@infraStartYearTooltip:Koko tutkimusinfrastruktuurin käyttöönottovuosi. Jos aloitusvuosi ei ole tiedossa, käytetään vuotta, jolloin tiedot on toimitettu tiedejatutkimus.fi-palveluun`
    },
    {
      label: $localize`:@@infraDescription:Infrastruktuurin kuvaus`,
      field: 'description',
      tooltip: $localize`:@@infraDescriptionTooltip:Kuvaus kertoo yleisesti tutkimusinfrastruktuurista.`
    },
    { label: $localize`:@@infraEndYear:Toiminta päättynyt`, field: 'endYear' },
    { label: $localize`:@@relationsToOtherInfrastruictures:hteydet muihin infrastruktuureihin`, field: 'connectionsToOtherInfras' },
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

  nodeList = [];
  edges = [];

  edgeLength = 350;
  edgeLength1 = 200;


  nodeListDemo1 = [
      {
        'id': 1,
        'color': '#8080da',
        'infraId': 'ttv-202512000769763',
        'label': 'FIN-ENV-RI',
        'isPartOf': [],
        'hasPart': ['ttv-202601000812049', 'ttv-202602000823839', 'ttv-202603000873597']
      },
      {
        'id': 2,
        'color': '#8080da',
        'infraId': 'research-infras-2016111643',
        'label': 'ESO',
        'isPartOf': ['ttv-202512000769763'],
        'hasPart': []
      },
      {
        'id': 3,
        'color': '#8080da',
        'infraId': 'research-infras-2016072528',
        'label': 'CTA (Suomi)',
        'isPartOf': ['ttv-202512000769763'],
        'hasPart': []
      },
      {
        'id': 4,
        'color': '#8080da',
        'infraId': 'ttv-202602000823839',
        'label': 'OULU-CLIM-OBS',
        'isPartOf': ['ttv-202512000769763'],
        'hasPart': []
      },
      {
        'id': 5,
        'color': '#8080da',
        'infraId': 'ttv-202603000873597',
        'label': 'OULU-CLIM-OBS2',
        'isPartOf': ['ttv-202512000769763'],
        'hasPart': ['ttv-202601000812049']
      },
      {
        'id': 6,
        'color': '#8080da',
        'infraId': 'ttv-202601000812049',
        'label': 'OULU-ENV-RI',
        'isPartOf': ['ttv-202512000769763'],
        'hasPart': ['ttv-202601000812030']
      },
      {
        'id': 7,
        'color': '#8080da',
        'infraId': 'ttv-202601000812030',
        'label': 'OULU-ARC-RI',
        'isPartOf': ['ttv-202601000812049'],
        'hasPart': ['ttv-202601000812058']
      },
      {
        'id': 8,
        'color': '#8080da',
        'infraId': 'ttv-202601000812058',
        'label': 'OULU-MAR-RI',
        'isPartOf': ['ttv-202601000812030'],
        'hasPart': []
      }
    ];

  nodeListDemo2 = [
    { id: 301, infraId: 'ICOS-FI', label: 'ICOS-FI', length: this.edgeLength },
    { id: 302, infraId: 'eLTER-FI', label: 'eLTER-FI', length: this.edgeLength },
    { id: 303, infraId: 'ANAEE-FI', label: 'ANAEE-FI', length: this.edgeLength },
    { id: 304, infraId: 'ACTRIS-FI', label: 'ACTRIS-FI', length: this.edgeLength },
    { id: 305, infraId: 'PALLAS', label: 'PALLAS', length: this.edgeLength },
    { id: 306, infraId: 'UTO', label: 'UTO', length: this.edgeLength },
    { id: 307, infraId: 'Marambio', label: 'Marambio', length: this.edgeLength },
    { id: 308, infraId: 'UAV', label: 'UAV', length: this.edgeLength },
    { id: 309, infraId: 'Radars', label: 'Radars', length: this.edgeLength },
    { id: 310, infraId: 'FMI-ARC', label: 'FMI-ARC', length: this.edgeLength },
    { id: 311, infraId: 'Lettosuo', label: 'Lettosuo', length: this.edgeLength },
    { id: 312, infraId: 'MAL', label: 'MAL', length: this.edgeLength },
    { id: 313, infraId: 'Ku-AtmSim', label: 'Ku-AtmSim', length: this.edgeLength },
    { id: 314, infraId: 'SMEAR', label: 'SMEAR', length: this.edgeLength },
    { id: 315, infraId: 'SMEAR1', label: 'SMEAR1', length: this.edgeLength },
    { id: 316, infraId: 'SMEAR2', label: 'SMEAR2', length: this.edgeLength },
    { id: 317, infraId: 'SMEAR3', label: 'SMEAR3', length: this.edgeLength },
    { id: 318, infraId: 'SMEAR4', label: 'SMEAR4', length: this.edgeLength },
    { id: 319, infraId: 'CAUS.CCC', label: 'CAUS.CCC', length: this.edgeLength },
    { id: 320, infraId: 'CiGas-UHEL', label: 'CiGas-UHEL', length: this.edgeLength },
    { id: 321, infraId: 'DC-CLU', label: 'DC-CLU', length: this.edgeLength },
    { id: 322, infraId: 'CCRES-fi', label: 'CCRES-fi', length: this.edgeLength },
    { id: 323, infraId: 'MRL', label: 'MRL', length: this.edgeLength },
    { id: 324, infraId: 'ACTGL', label: 'ACTGL', length: this.edgeLength },
    { id: 325, infraId: 'INAR-RI', label: 'INAR-RI', length: this.edgeLength },
    { id: 326, infraId: 'ICOS', label: 'ICOS', length: this.edgeLength },
    { id: 327, infraId: 'ELTER', label: 'ELTER', length: this.edgeLength },
    { id: 328, infraId: 'ANAEE', label: 'ANAEE', length: this.edgeLength },
    { id: 329, infraId: 'ACTRIS', label: 'ACTRIS', length: this.edgeLength }
  ];

  // Create imaginary network of connected nodes
  edgesDemo1 = [
    { from: 1, to: 3, length: this.edgeLength1 },
    { from: 3, to: 2, length: this.edgeLength1 },
    { from: 2, to: 3, length: this.edgeLength1 },
    { from: 2, to: 4, length: this.edgeLength1 },
    { from: 3, to: 5, length: this.edgeLength1 },
    { from: 5, to: 4, length: this.edgeLength1 },
    { from: 4, to: 7, length: this.edgeLength1 },
    { from: 6, to: 8, length: this.edgeLength1 },
    { from: 8, to: 7, length: this.edgeLength1 }
  ];


  edgesDemo2 = [
    { from: 305, to: 301, length: this.edgeLength },
    { from: 305, to: 304, length: this.edgeLength },
    { from: 306, to: 301, length: this.edgeLength },
    { from: 306, to: 304, length: this.edgeLength },
    { from: 307, to: 304, length: this.edgeLength },
    { from: 308, to: 304, length: this.edgeLength },
    { from: 309, to: 304, length: this.edgeLength },
    { from: 310, to: 301, length: this.edgeLength },
    { from: 311, to: 301, length: this.edgeLength },
    { from: 312, to: 304, length: this.edgeLength },
    { from: 324, to: 304, length: this.edgeLength },
    { from: 313, to: 304, length: this.edgeLength },
    { from: 315, to: 301, length: this.edgeLength },
    { from: 315, to: 304, length: this.edgeLength },
    { from: 316, to: 301, length: this.edgeLength },
    { from: 316, to: 304, length: this.edgeLength },
    { from: 317, to: 301, length: this.edgeLength },
    { from: 317, to: 304, length: this.edgeLength },
    { from: 318, to: 301, length: this.edgeLength },
    { from: 318, to: 304, length: this.edgeLength },
    { from: 315, to: 314, length: this.edgeLength },
    { from: 316, to: 314, length: this.edgeLength },
    { from: 317, to: 314, length: this.edgeLength },
    { from: 318, to: 314, length: this.edgeLength },
    { from: 319, to: 304, length: this.edgeLength },
    { from: 320, to: 304, length: this.edgeLength },
    { from: 321, to: 304, length: this.edgeLength },
    { from: 322, to: 304, length: this.edgeLength },
    { from: 323, to: 301, length: this.edgeLength },
    { from: 301, to: 325, length: this.edgeLength },
    { from: 302, to: 325, length: this.edgeLength },
    { from: 303, to: 325, length: this.edgeLength },
    { from: 304, to: 325, length: this.edgeLength },
    { from: 301, to: 326, length: this.edgeLength },
    { from: 302, to: 327, length: this.edgeLength },
    { from: 303, to: 328, length: this.edgeLength },
    { from: 304, to: 329, length: this.edgeLength },
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
  infraNetworkSub: Subscription;
  private selectedServiceUrn: string;
  private positionInitialized = false;
  private selectedServiceIndex: number = undefined;
  selectedInfraId = '';
  selectedInfraNodeId = '';
  selectedInfraName = '';
  infraPageLink = '/results/infrastructures/';
  showDialog  = new BehaviorSubject(undefined);
  infraRootId  = new BehaviorSubject(undefined);

  infraServices: InfraService[] = [];

  listbox = viewChild<Listbox<string>>(Listbox);

  /** The options available in the listbox. */
  options = viewChildren<Option<string>>(Option);

  /** A reference to the ng aria combobox. */
  combobox = viewChild<Combobox<string>>(Combobox);

  /** The string that is displayed in the combobox. */
  displayValue = computed(() => {
    const values = this.listbox()?.values() || [];
    return values.length ? values[0] : 'Select a label';
  });

  /** The labels that are available for selection. */
  isPartOfLabels = [];
  hasPartLabels = [];

  isPartOfLabelsVisible = true;
  hasPartLabelsVisible = true;

  constructor(
    private route: ActivatedRoute,
    private singleService: SingleItemService,
    private searchService: SearchService,
    private tabChangeService: TabChangeService,
    @Inject(LOCALE_ID) protected localeId: string,
    public utilityService: UtilityService,
    private settingsService: SettingsService,
    @Inject(DOCUMENT) private document: any,
    private appSettingsService: AppSettingsService,
    private router: Router,
    public dialog: MatDialog,
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;

    afterRenderEffect(() => {
      const option = this.options().find((opt) => opt.active());
      setTimeout(() => option?.element.scrollIntoView({block: 'nearest'}), 50);
    });

    // Resets the listbox scroll position when the combobox is closed.
    afterRenderEffect(() => {
      if (!this.combobox()?.expanded()) {
        setTimeout(() => this.listbox()?.element.scrollTo(0, 0), 150);
      }
    });
  }

  public setTitle(newTitle: string) {
    this.utilityService.setTitle(newTitle);
  }

  ngOnInit() {
    this.idSub = this.singleService.currentId.subscribe((id) => {
      this.selectedInfraId = id;
      this.getData(id, false);
      this.getInfraNetworkData(id);
    }
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
    this.infraNetworkSub?.unsubscribe();
  }

  getInfraNetworkData(id?: string){
    this.infraNetworkSub = this.singleService.getInfrastructureNetworkData(undefined).subscribe({next: (responseData) => {
      this.infraNetworkResponseData = responseData;
      },
      error: (error) => (this.errorMessage = error as any)
    });
  }

  processInfraNetworkData(data: any) {
    const tempNodes = data.hits.hits[0]._source.nodes;
    const tempEdges = data.hits.hits[0]._source.hasPartEdges;
    let tempNodeList = [];
    let tempEdgeList = [];

    tempNodes.forEach((node) => {
        if (node.nodeTypeNational) {
          tempNodeList.push({
            id: node.internalId,
            label: node.nodeTypeNational.acronym,
            infraId: node.nodeTypeNational.infraKeyIdentifier.substring(11),
            length: this.edgeLength
          });
        } else if (node.nodeTypeInternational) {
          tempNodeList.push({
            id: node.internalId,
            label: node.nodeTypeInternational.internationalInfraName,
            length: this.edgeLength
          });
        }
    });

    tempEdges.forEach((edge) => {
      if (edge?.relationFrom && edge?.relationTo) {
        tempEdgeList.push({to: edge.relationFrom?.internalId, from: edge.relationTo?.internalId, length: this.edgeLength});
      }
    });
    this.nodeList = tempNodeList;
    this.edges = tempEdgeList;
  }

  getData(id: string, isModalData: boolean) {
    this.selectedInfraId = id;
    this.dataSub = this.singleService.getSingleInfrastructure(id).subscribe({
      next: (responseData) => {

        if (isModalData) {
          this.modalInfraData = responseData;
          this.infraRootId.next(this.nodeList.filter(node => node.label === this.responseData.infrastructures[0]?.acronym)[0]?.id);
          //this.shapeData(isModalData);
          //this.filterData(isModalData);
          return;
        }
        else {
          this.responseData = responseData;
          this.modalInfraData = responseData;
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

            this.shapeData(isModalData);
            this.filterData(isModalData);
          }
        }
      },
      error: (error) => (this.errorMessage = error as any)
    });
  }

  filterData(isModalData: boolean) {
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
      this.infraServices.push({serviceName: service.name, serviceDescription: service.description});
      this.showService.push(false);
      this.showServicePoint.push([]);
      service.servicePoints.forEach((_) =>
        this.showServicePoint[idx].push(false)
      );
    });
  }

  shapeData(isModalData: boolean) {
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

  openDialog(infraNumber: number){
    if (infraNumber === 1) {
      this.nodeList = [...this.nodeListDemo1];
      this.edges = [...this.edgesDemo1];
    } else if (infraNumber === 2) {
      this.nodeList = [...this.nodeListDemo2];
      this.edges = [...this.edgesDemo2];
    } else {
      this.processInfraNetworkData(this.infraNetworkResponseData);
    }
    this.showDialog.next(true);
  }

  calculateIsPartOf(selectedNodeId: number) {
    this.isPartOfLabels = [];
    this.edges.filter(node => node.from === selectedNodeId).forEach(edge => {
      this.nodeList.filter(node => {
        if (node.id === edge.to) {
          this.isPartOfLabels.push(node.label);
        }
        ;
      });
    });
  }

  calculateHasPart(selectedNodeId: number) {
    this.hasPartLabels = [];
    this.edges.filter(node => node.to === selectedNodeId).forEach(edge => {
      this.nodeList.filter(node => {
        if (node.id === edge.from) {
          this.hasPartLabels.push(node.label);
        }
        ;
      });
    });
  }

  doDialogAction(event: any){
    this.showDialog.next(false);
  }

  infraNodeClickOld(infraUrn: string){
    this.getData(infraUrn, true);
  }

  infraNodeClick(nodeId: number){
    let selectedInfraNode = this.nodeList.filter(node => node.id === nodeId);
    this.selectedInfraName = selectedInfraNode[0].label;
    this.getData(selectedInfraNode[0].infraId, true);
    this.calculateIsPartOf(nodeId);
    this.calculateHasPart(nodeId);
  }

  reloadNewInfra(infraAcronym: string){
    this.responseData = cloneDeep(this.modalInfraData);
    const rootId = this.nodeList.filter(node => node.label === infraAcronym)[0]?.id;
    this.infraRootId.next(rootId);
  }

  navigateToSelectedInfra(){
    this.showDialog.next(false);
    this.dialog.closeAll();
    this.router.navigateByUrl('/results/infrastructure/' + this.selectedInfraId);
    //this.infraServices = [];
    //this.ngOnInit();
  }
}
