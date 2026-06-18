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
  DOCUMENT,
  QueryList,
  ViewChildren,
  AfterViewInit,
  inject,
  viewChild,
  viewChildren,
  computed,
  afterRenderEffect,
  ChangeDetectionStrategy
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
import { VisComponent, visualizationData } from '../../../../vis-component/vis-component';
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
  ComboboxPopupContainer
} from '@angular/aria/combobox';
import { Listbox, Option } from '@angular/aria/listbox';
import { OverlayModule } from '@angular/cdk/overlay';
import { cloneDeep, toInteger } from 'lodash-es';
import { MatRadioButton, MatRadioGroup } from '@angular/material/radio';
import { MatProgressSpinner } from '@angular/material/progress-spinner';

type TreeNode = {
  name: string;
  value: string;
  hasChildren?: boolean;
  hasParent?: boolean;
  children?: TreeNode[];
  disabled?: boolean;
  expanded?: boolean;
  isCurrent?: boolean;
};

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
    MatRadioButton,
    MatRadioGroup,
    MatProgressSpinner
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
  reducedNetworkSize = true;

  infraTreeLoading = false;

  isPartOfDropdownVisible = false;
  hasPartDropdownVisible = false;

  infraTreeNodes: TreeNode[];

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

  infraTreeInfoText = $localize`:@@infraTreeInfoText:Näet tässä valitun infrastruktuurin osana laajempaa infrastruktuurien verkostoa`;
  infraTreeBelongsToManyNetworks = $localize`:@@infraTreeBelongsToManyNetworks:Kohde kuuluu useaan infrastruktuuriverkostoon`;

  infraModalTexts = {
    'acronym': $localize`:@@infraAcronymAndName:Lyhenne ja nimi`,
    'startYear': $localize`:@infraStartYear:Toiminta alkanut`,
    'description': $localize`:@@infraDescription:Infrastruktuurin kuvaus`,
    'relationToOtherInfras': $localize`:@@relationToOtherInfras:Yhteydet muihin infrastruktuureihin`,
    'showDirectConnections': $localize`:@@showDirectConnections:Näytä suorat liitokset`,
    'showFullNetwork': $localize`:@@showFullNetwork:Näytä koko verkosto`,
    'dataMissing': $localize`:@@dataMissing:Tietoja ei ole saatavilla.`,
    'goToInfraPage': $localize`:@@moveToInfraPage:Siirry infrastruktuurin sivulle`,
    'includesInfrastructures': $localize`:@@includesInfrastructures:Sisältää infrastruktuurit`,
    'isPartOfInfrastructures': $localize`:@@includesInfrastructures:On osa infrastruktuureja`,
    'networkShownInPicture': $localize`:@@networkShownInPicture:Verkosto esitetty kuvassa.`,
    'showNetworkGraph': $localize`:@@showNetworkGraph:Näytä verkostokuva`,
    'isPart': $localize`:@@isPart:On osa`,
    'ofInfrastructure': $localize`:@@ofInfrastructure:infrastrukuuria`
  };

  modalInfoFields = [
    {
      label: $localize`:@@infraAcronymAndName:Lyhenne ja nimi`,
      field: 'acronym'
    },
    {
      label: $localize`:@@Name:Nimi`,
      field: 'name'
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
    {
      label: $localize`:@@relationsToOtherInfrastruictures:hteydet muihin infrastruktuureihin`,
      field: 'connectionsToOtherInfras'
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

  nodeList = [];
  edges = [];

  visibleNodes = new BehaviorSubject([]);
  visibleEdges = new BehaviorSubject([]);

  edgeLength = 500;

  linkFields = [{ field: 'homepage' }];

  errorMessage = [];
  @ViewChild('srHeader', { static: true }) srHeader: ElementRef;
  @ViewChild('backToResultsLink') backToResultsLink: ElementRef;
  @ViewChildren('servicesRefs') private servicesRefs: QueryList<ElementRef>;

  idSub: Subscription;
  routeParamsSub: Subscription;
  serviceSub: Subscription
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
  selectedInfraNodeId: number = undefined;
  selectedInfraName = '';
  infraPageLink = '/results/infrastructures/';
  showDialog = new BehaviorSubject(undefined);
  infraRootId = new BehaviorSubject(undefined);
  visData = new BehaviorSubject(undefined);

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

  isPartOfConnectionsForTree = [];
  hasPartConnectionsForTree = [];


  isPartOfLabelsUpper = [];
  hasPartLabelsUpper = [];
  isPartOfLabelsBottom = [];
  hasPartLabelsBottom = [];

  isPartOfLabelsVisible = true;
  hasPartLabelsVisible = true;
  rootId = '';
  rootNodeName = '';

  isInited = false;

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
    public dialog: MatDialog
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;

    afterRenderEffect(() => {
      const option = this.options().find((opt) => opt.active());
      setTimeout(() => option?.element.scrollIntoView({ block: 'nearest' }), 50);
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
    //this.infraTreeLoading = true;
    this.idSub = this.singleService.currentId.subscribe((id) => {
      this.selectedInfraId = id;
      this.getData(id, false);
      }
    );
    this.serviceSub = this.route.queryParamMap.subscribe(params => {
      this.selectedServiceUrn = params.get('service');
    });

    this.routeParamsSub = this.route.params.subscribe(params => {
      this.singleService.updateId(params.id);
      //this.selectedInfraId = params.id;
      //this.getData(params.id, false);
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
    this.routeParamsSub?.unsubscribe();
    this.serviceSub?.unsubscribe();
    this.focusSub?.unsubscribe();
    this.dataSub?.unsubscribe();
    this.servicesRefsSub?.unsubscribe();
    this.settingsService.related = false;
    this.infraNetworkSub?.unsubscribe();
  }

  getInfraNetworkData(id?: string) {
    if (id) {
      this.infraNetworkSub = this.singleService.getInfrastructureNetworkData(undefined).subscribe({
        next: (responseData) => {
          this.infraNetworkResponseData = responseData;
          this.processInfraNetworkData(this.infraNetworkResponseData);
          this.reduceNetworkSize(this.reducedNetworkSize);

        },
        error: (error) => (this.errorMessage = error as any)
      });
    }
  }

  calculateNodeSize(node: any){
    const defaultSize = 30;
    if (false && node?.hasPartMetrics?.hasPartTotal > 0){
      return node?.hasPartMetrics?.hasPartTotal * 3 + defaultSize;
    } else return defaultSize;
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
          label: node.nodeTypeNational?.acronym,
          infraId: node.nodeTypeNational.infraKeyIdentifier.substring(11),
          length: this.edgeLength,
          size: this.calculateNodeSize(node)
        });
      } else if (node.nodeTypeInternational) {
        tempNodeList.push({
          id: node.internalId,
          label: node.nodeTypeInternational.internationalInfraName,
          length: this.edgeLength,
          size: this.calculateNodeSize(node)
        });
      }
    });

    tempEdges.forEach((edge) => {
      if (edge?.relationFrom && edge?.relationTo) {
        tempEdgeList.push({
          to: edge.relationFrom?.internalId,
          from: edge.relationTo?.internalId,
          length: this.edgeLength
        });
      }
    });

    this.nodeList = tempNodeList;
    this.edges = tempEdgeList;
    this.visibleNodes.next(tempNodeList);
    this.visibleEdges.next(tempEdgeList);
    this.infraRootId.next(this.nodeList.filter(node => node.label === this.responseData.infrastructures[0]?.acronym)[0]?.id);
    this.calculateIsPartOf(toInteger(this.infraRootId.getValue()), true);
    this.calculateHasPart(toInteger(this.infraRootId.getValue()), true);
    this.rootId = this.infraRootId.getValue();

    this.calculateConnectionsForTree();

    const rootNode = this.nodeList.filter(node => node.id === toInteger(this.rootId));
    this.rootNodeName = rootNode[0].label;

    this.visData.next({
      edges: [...this.edges],
      nodeList: [...this.nodeList],
      rootId: '' + this.infraRootId.getValue()
    });
  }


  reduceNetworkSize(isReduced: boolean) {
    this.reducedNetworkSize = isReduced;
    if (isReduced) {
      const visEdges = this.edges.filter(edge => (edge.from === toInteger(this.rootId) || edge.to === toInteger(this.rootId)));
      const visNodes = this.nodeList.filter(node => visEdges.find(edge => edge.from === node.id || edge.to === node.id));
      this.calculateIsPartOf(toInteger(this.rootId), true);
      this.calculateHasPart(toInteger(this.rootId), true);
      this.visData.next({ edges: visEdges, nodeList: visNodes, rootId: '' + this.rootId });
    } else {
      this.calculateIsPartOf(toInteger(this.rootId), true);
      this.calculateHasPart(toInteger(this.rootId), true);
      this.visData.next({ edges: [...this.edges], nodeList: [...this.nodeList], rootId: '' + this.rootId });
    }
  }

  selectNode(nodeId: number) {
    let newVisData = this.visData.getValue();
    newVisData.selectedNodeId = nodeId;
    this.visData.next(cloneDeep(newVisData));
  }

  getData(id: string, isModalData: boolean) {
    //this.selectedInfraId = id;
    this.dataSub = this.singleService.getSingleInfrastructure(id).subscribe({
      next: (responseData) => {

        if (isModalData) {
          // Reload modal data
          this.modalInfraData = responseData;
          //this.infraRootId.next(this.nodeList.filter(node => node.label === this.responseData.infrastructures[0]?.acronym)[0]?.id);
          //this.shapeData(isModalData);
          //this.filterData(isModalData);
          return;
        } else {
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
            //this.srHeader.nativeElement.innerHTML = titleString?.split(' - ', 1) ?? '';
            this.utilityService.addMeta(
              titleString,
              this.metaTags['description' + this.currentLocale],
              this.commonTags['imgAlt' + this.currentLocale]
            );

            this.shapeData(isModalData);
            this.filterData(isModalData);
          }
        }
        this.getInfraNetworkData(id);
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
    this.infraServices = [];
    this.responseData.infrastructures[0].services.forEach((service, idx) => {
      this.infraServices.push({ serviceName: service.name, serviceDescription: service.description });
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
      .map((service) => {
          if (service.urn?.length > 11) {
            if (service.urn.substring(11, service.urn.length) === this.selectedServiceUrn) {
              this.showService[openedInd] = true;
              this.selectedServiceIndex = openedInd;
            }
          }
          openedInd += 1;
          return UtilityService.objectHasContent(service) ? service : undefined;
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

  openDialog(infraNumber: number) {
    this.showDialog.next(true);
  }

  calculateConnectionsForTree(){
    this.isPartOfConnectionsForTree = [];
    this.hasPartConnectionsForTree = [];
    this.edges.filter(node => node.from === this.infraRootId.getValue()).forEach(edge => {
      this.nodeList.filter(node => {
        if (node.id === edge.to) {
         this.isPartOfConnectionsForTree.push({ id: node.id, label: node.label, infraId: node?.infraId });
        }
        ;
      });
    });
    this.edges.filter(node => node.to === this.infraRootId.getValue()).forEach(edge => {
      this.nodeList.filter(node => {
        if (node.id === edge.from) {
         this.hasPartConnectionsForTree.push({ id: node.id, label: node.label, infraId: node?.infraId });
        }
        ;
      });
    });
    let rootNodeName = this.nodeList.filter(node => node.id === this.infraRootId.getValue())[0].label;
    this.generateInfraTrees(rootNodeName);
  }

  generateInfraTrees(rootNodeName: string){
    let nodes = [
      {
        name: rootNodeName,
        value: this.infraRootId.getValue(),
        hasParent: false,
        isCurrent: true,
        children: [],
        expanded: true,
      }];
    let childNodes = [];
    this.hasPartConnectionsForTree.forEach(node => {
      let childNode = {
        name: node.label,
        value: node.id,
        hasParent: true,
        expanded: true,
        infraId: node.infraId,
      };
      childNodes.push(childNode);
    });
    nodes[0].children = childNodes;

    let rootTrees = [];

    if (this.isPartOfConnectionsForTree.length > 0){
      this.isPartOfConnectionsForTree.forEach(node => {
        let childNode = {
          name: node.label,
          value: node.id + '',
          hasParent: true,
          expanded: true,
          infraId: node.infraId,
          children: []
        };
        childNode.children.push(nodes[0]);
        rootTrees.push(childNode);
      });
    } else {
      rootTrees.push(nodes[0]);
    }

    this.infraTreeNodes = rootTrees;
    this.infraTreeLoading = false;
  }

  calculateIsPartOf(selectedNodeId: number, isUpperLegend: boolean) {
    if (isUpperLegend) {
      this.isPartOfLabelsUpper = [];
    } else {
      this.isPartOfLabelsBottom = [];
    }
    this.edges.filter(node => node.from === selectedNodeId).forEach(edge => {
      this.nodeList.filter(node => {
        if (node.id === edge.to) {
          if (isUpperLegend) {
            this.isPartOfLabelsUpper.push({ id: node.id, label: node.label });
          } else {
            this.isPartOfLabelsBottom.push({ id: node.id, label: node.label });
          }
        }
        ;
      });
    });
  }

  calculateHasPart(selectedNodeId: number, isUpperLegend: boolean) {
    if (isUpperLegend) {
      this.hasPartLabelsUpper = [];
    } else {
      this.hasPartLabelsBottom = [];
    }
    this.edges.filter(node => node.to === selectedNodeId).forEach(edge => {
      this.nodeList.filter(node => {
        if (node.id === edge.from) {
          if (isUpperLegend) {
            this.hasPartLabelsUpper.push({ id: node.id, label: node.label });
          } else {
            this.hasPartLabelsBottom.push({ id: node.id, label: node.label });
          }
        }
        ;
      });
    });
  }

  doDialogAction(event: any) {
    this.showDialog.next(false);
  }

  infraNodeClickFromList(infra: any) {
    this.selectedInfraNodeId = infra.id;
    this.selectedInfraName = infra.label;
    this.selectNode(infra.id);
    this.getData(infra.id, true);
    this.infraNodeClick(infra.id);
  }

  infraNodeClick(nodeId: number) {
    this.selectedInfraNodeId = nodeId;
    let selectedInfraNode = this.nodeList.filter(node => node.id === nodeId);
    this.selectedInfraName = selectedInfraNode[0].label;
    this.selectedInfraId = selectedInfraNode[0].infraId;
    this.getData(selectedInfraNode[0].infraId, true);
    this.calculateIsPartOf(nodeId, false);
    this.calculateHasPart(nodeId, false);
  }

  setNewRootNode(infraAcronym: string) {
    let rootId = undefined;
    if (infraAcronym) {
      rootId = this.nodeList.filter(node => node.label === infraAcronym)[0]?.id;
    } else {
      rootId = '' + this.selectedInfraNodeId;
    }
    this.infraRootId.next(rootId);
    this.rootId = rootId;

    const rootNode = this.nodeList.filter(node => node.id === toInteger(rootId));
    this.rootNodeName = rootNode[0].label;

    // Use unfiltered data
    this.visData.next({
      edges: [...this.edges],
      nodeList: [...this.nodeList],
      rootId: '' + this.infraRootId.getValue()
    });
    this.reduceNetworkSize(true);
  }

  navigateToSelectedInfra() {
    if (this.selectedInfraId) {
      this.router.navigateByUrl('/results/infrastructure/' + this.selectedInfraId).then(() => {
        this.showDialog.next(false);
        this.dialog.closeAll();
        //window.location.reload();
      });;
      //this.infraServices = [];
    }
  }
}
