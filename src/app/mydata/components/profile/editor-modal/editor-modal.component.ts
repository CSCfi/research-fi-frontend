//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter, Inject,
  Input, LOCALE_ID,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation
} from '@angular/core';
import { checkSelected } from '@mydata/utils';
import { cloneDeep } from 'lodash-es';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { MatTabChangeEvent, MatTabGroup, MatTab, MatTabLabel } from '@angular/material/tabs';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { CommonStrings } from '@mydata/constants/strings';
import {
  PublicationColumns,
  DatasetColumns,
  ActivityColumns,
  FundingColumns,
  PortalGroupIds,
} from '@mydata/constants';
import { EditorModalColumn } from 'src/types';
import { SearchPortalService } from '@mydata/services/search-portal.service';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { DialogComponent } from '../../../../shared/components/dialog/dialog.component';
import { SearchPortalComponent } from '../search-portal/search-portal.component';
import { ProfileItemsTableComponent } from '../profile-items-table/profile-items-table.component';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ProfilePanelComponent } from '../profile-panel/profile-panel.component';
import { AutofocusDirective } from '../../../../shared/directives/autofocus.directive';
import { NgIf } from '@angular/common';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-editor-modal',
    templateUrl: './editor-modal.component.html',
    styleUrls: ['./editor-modal.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
  imports: [
    NgIf,
    MatCheckbox,
    AutofocusDirective,
    ProfilePanelComponent,
    MatTabGroup,
    MatTab,
    FontAwesomeModule,
    ProfileItemsTableComponent,
    MatTabLabel,
    SearchPortalComponent,
    DialogComponent,
    SvgSpritesComponent
  ]
})
export class EditorModalComponent implements OnInit {
  @Input() dialogData: { data: any; trigger: number };
  showDialog: boolean;
  editorData: any;
  originalEditorData: any;

  allSelected: boolean;
  someSelected: boolean;
  selectedItems: any[];
  toggleAllDisabled: boolean = false;

  primarySource: string;

  @Output() emitClose = new EventEmitter<boolean>();
  @Output() onEditorClose = new EventEmitter<any>();

  publicationPayload: any[];

  checkSelected = checkSelected;

  patchPayload = [];

  dialogActions: any[];

  basicDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@continue:Jatka`, primary: true, method: 'save' },
  ];

  searchFromPortalDialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
  ];

  @ViewChild('selectAllCheckbox') selectAllCheckbox: MatCheckbox;

  portalModalIndicatorIds = PortalGroupIds;

  disabledSearchPortalModalIds = [GroupTypes.activitiesAndRewards];

  faSearch = faSearch as any; // TODO: Fix type

  currentTabIndex: number = 0;
  importedItems: any[];
  tableColumns: EditorModalColumn[];

  // Dynamic strings used in tabs
  addFromPortalTabString: string;
  portalItemGroupStringPlural: string;
  selectItemsTabLabel: string;
  tabInfoText: string;
  chooseItemsText: string;

  constructor(
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService,
    private searchPortalService: SearchPortalService,
    @Inject(LOCALE_ID) protected localeId: string,
  ) {}

  ngOnInit(): void {
    this.showDialog = true;
    this.editorData = this.dialogData.data;
    this.originalEditorData = cloneDeep(this.dialogData.data);
    this.primarySource = this.editorData.primarySource;
    this.dialogActions = this.basicDialogActions;

    this.itemClicked();

    switch (this.dialogData.data.id) {
      case 'publication': {
        this.addFromPortalTabString = $localize`:@@publications:julkaisuja`;
        this.portalItemGroupStringPlural = $localize`:@@publications:julkaisut`;
        this.tableColumns = PublicationColumns;
        this.selectItemsTabLabel = $localize`:@@selectPublications:Valitse julkaisut`;
        this.tabInfoText = $localize`:@@myDataEditorModalPublicationTabInfo:Tiedejatutkimus.fi-palvelusta löytyvät julkaisut, joissa on ORCID-tunnuksesi, lisätään tietoihisi automaattisesti. Julkaisuja, joihin ei ole liitetty ORCID-tunnustasi, voit lisätä "Hae muita julkaisuja" -toiminnolla.`;
        this.chooseItemsText = $localize`:@@myDataEditorModalPublicationChooseItems:Voit valita profiiliisi julkaisuja alla olevasta listasta.`;
        break;
      }
      case 'dataset': {
        this.addFromPortalTabString = $localize`:@@datasets:aineistoja`;
        this.portalItemGroupStringPlural = $localize`:@@datasets:aineistot`;
        this.tableColumns = DatasetColumns;
        this.selectItemsTabLabel = $localize`:@@selectDatasets:Valitse aineistot`;
        this.tabInfoText = $localize`:@@myDataEditorModalDatasetTabInfo:Tiedejatutkimus.fi-palvelusta löytyvät tutkimusaineistot, joissa on ORCID-tunnuksesi, lisätään profiiliisi automaattisesti. Aineistoja, joihin ei ole liitetty ORCID-tunnustasi, voit lisätä "Hae muita tutkimusaineistoja" -toiminnolla.`;
        this.chooseItemsText = $localize`:@@myDataEditorModalDatasetChooseItems:Voit valita profiiliisi tutkimusaineistoja alla olevasta listasta.`;
        break;
      }
      case 'funding': {
        this.addFromPortalTabString = $localize`:@@fundings:rahoitusmyöntöjä`;
        this.selectItemsTabLabel = $localize`:@@selectGrantedFunding:Valitse myönnetty rahoitus`;
        this.portalItemGroupStringPlural = $localize`:@@fundings:rahoitusmyönnöt`;
        this.tableColumns = FundingColumns;
        this.tabInfoText = $localize`:@@myDataEditorModalFundingTabInfo:Tiedejatutkimus.fi-palvelusta löytyvät rahoitusmyönnöt, joissa on ORCID-tunnuksesi, lisätään tietoihisi automaattisesti. Myönnettyä rahoitusta, joihin ei ole liitetty ORCID-tunnustasi, voit lisätä "Hae muita myönnetyjä rahoituksia" -toiminnolla.`;
        break;
      }
      case 'activitiesAndRewards': {
        this.addFromPortalTabString = $localize`:@@activities:aktiviteetteja`;
        this.selectItemsTabLabel = $localize`:@@selectActivities:Valitse aktiviteetit`;
        this.portalItemGroupStringPlural = $localize`:@@activities:aktiviteetit`;
        this.tableColumns = ActivityColumns;
        this.localizeActivitiesAndRewardsColumns();
        this.tabInfoText = $localize`:@@myDataEditorModalActivityTabInfo:Voit muokata ORCIDista tuotuja tietoja ORCID-profiilissasi. Tietojen päivittyminen voi viedä noin vuorokauden. Kotiorganisaatiosta tuotuja tietoja voi muokata vain oman organisaation järjestelmässä.`;
        break;
      }
    }

    this.portalItemGroupStringPlural =
      this.portalItemGroupStringPlural?.toLowerCase();
  }

  localizeActivitiesAndRewardsColumns() {
    this.tableColumns.forEach(item => {
        if (item.additionalFields) {
          item.additionalFields.map(it => {
            if (it.field === 'organizationName') {
              it.field = 'organizationName' + this.localeId.charAt(0).toUpperCase() + this.localeId.charAt(1);
            }
            if (it.field === 'departmentName'){
              it.field = 'departmentName' + this.localeId.charAt(0).toUpperCase() + this.localeId.charAt(1);
            }
          });
        }
      }
    );
  }

  itemClicked() {
    const fields = this.editorData.fields;

    const items = fields
      .flatMap((field) => field.items);

    this.toggleAllDisabled = items.length === 0;

    this.allSelected = !!!items.some((item) => !item.itemMeta.show);

    this.selectedItems = items.filter((item) => item.itemMeta.show);

    this.someSelected = this.allSelected
      ? false
      : !!items.some((item) => item.itemMeta.show);
  }

  toggleAll(event) {
    this.allSelected = event.checked;

    // Change detection won't work if nested properties change
    const copy = cloneDeep(this.editorData);

    this.editorData = {};
    const patchItems = [];

    copy.fields.forEach((field) => {
      if (field.selectedPublications)
        field.selectedPublications.map((item) => (item.show = event.checked));

      field.items.map((item) => {
        // Single selections should always have show as true. Therefore these items shouldn't be altered
        if (!field.single && item) {
          item.itemMeta.show = event.checked;
          patchItems.push(item.itemMeta);
        }
      });
    });

    this.editorData = { ...copy };
    this.itemClicked();
    this.patchService.addToPayload(patchItems);
  }

  doDialogAction(action: string) {
    switch (action) {
      case 'save': {
        this.patchService.confirmPayload();
        this.publicationsService.confirmPayload();
        this.datasetsService.confirmPayload();
        this.fundingsService.confirmPayload();

        return this.onEditorClose.emit(this.editorData);
      }
      case 'cancel': {
        this.patchService.clearPayload();
        this.publicationsService.clearPayload();
        this.publicationsService.clearDeletables();
        break;
      }
    }

    this.onEditorClose.emit(null); // close component wrapper from parent
    this.showDialog = false;
  }

  onTabChange(event: MatTabChangeEvent) {
    this.currentTabIndex = event.index;
    this.searchPortalService.resetSort();

    if (event.index === 0) {
      this.dialogActions = [...this.basicDialogActions];
      this.itemClicked();
    } else if (event.index === 1) {
      this.dialogActions = [...this.searchFromPortalDialogActions];
      this.selectedItems = [];
    }
  }

  // For use of imported items
  handleSelection(items) {
    // Display 'add' button only if selected items
    if (!this.dialogActions.find((action) => action.method === 'add')) {
      this.dialogActions = [
        ...this.searchFromPortalDialogActions,
        {
          label2: `Lisää valitut ${this.portalItemGroupStringPlural} tietoihini`,
          label:
            $localize`:@@addSelected:Lisää valitut` +
            ` ${this.portalItemGroupStringPlural} ` +
            $localize`:@@toMyInformation:tietoihini`,
          primary: true,
          method: 'add',
          action: () => this.addItems(),
        },
      ];
    }

    if (items.length === 0) {
      this.dialogActions = this.dialogActions.filter(
        (action) => action.method !== 'add'
      );
    }

    this.importedItems = items;
    this.selectedItems = items;
  }

  // Add items that have been imported from portal search
  addItems() {
    const group = this.dialogData.data;
    let fieldType: number;
    let service: PublicationsService | DatasetsService | FundingsService;
    let label = '';

    switch (group.id) {
      case 'publication': {
        fieldType = FieldTypes.activityPublication;
        service = this.publicationsService;
        label = $localize`:@@addedPublications:Tuodut julkaisut`;
        break;
      }
      case 'dataset': {
        fieldType = FieldTypes.activityDataset;
        service = this.datasetsService;
        label = $localize`:@@addedDatasets:Tuodut aineistot`;
        break;
      }
      case 'funding': {
        fieldType = FieldTypes.activityFunding;
        service = this.fundingsService;
        label = $localize`:@@addedProjects:Tuodut hankkeet`;
        break;
      }
    }

    const selection = this.importedItems?.map((item) => ({
      ...item,
      ...(group.id === 'publication' && { publicationName: item.title }),
      dataSources: [
        {
          id: null,
          organization: {
            nameFi: CommonStrings.ttvLabel,
            nameSv: CommonStrings.ttvLabel,
            nameEn: CommonStrings.ttvLabel,
          },
          registeredDataSource: 'TTV',
        },
      ],
      itemMeta: {
        id: item.id,
        type: fieldType,
        show: true,
        primaryValue: true,
      },
    }));

    service.addToPayload(selection);

    // Merge imported items to previous data
    const itemsGroup = group.fields.find((el) => el.id === group.id);
    itemsGroup.items = itemsGroup.items.concat(selection);

    this.currentTabIndex = 0;

    // /*
    //  * Create new field for recently imported items.
    //  * Add selected items into imported field if user decides to add more items.
    //  */
    // const imported = group.fields.find((field) => field.id === 'imported');

    // if (imported) {
    //   imported.items = imported.items.concat(selection);
    // } else {
    //   group.fields.unshift({
    //     id: 'imported',
    //     label: label,
    //     items: selection,
    //   });
    // }
  }
}
