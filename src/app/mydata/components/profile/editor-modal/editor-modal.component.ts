//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { checkSelected } from '@mydata/utils';
import { cloneDeep } from 'lodash-es';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { MatCheckbox } from '@angular/material/checkbox';
import { faSearch } from '@fortawesome/free-solid-svg-icons';
import { MatTabChangeEvent } from '@angular/material/tabs';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { CommonStrings } from '@mydata/constants/strings';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
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

  portalModalIndicatorIds = ['publication', 'dataset', 'funding'];

  faSearch = faSearch;

  currentTabIndex: number;
  importedItems: any[];
  addFromPortalTabString: string;
  portalItemGroupStringPlural: string;

  constructor(
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService
  ) {}

  ngOnInit(): void {
    this.showDialog = true;
    this.editorData = this.dialogData.data;
    this.originalEditorData = cloneDeep(this.dialogData.data);
    this.primarySource = this.editorData.primarySource;
    this.dialogActions = this.basicDialogActions;

    this.checkAllSelected();

    switch (this.dialogData.data.id) {
      case 'publication': {
        this.addFromPortalTabString = 'julkaisuja';
        this.portalItemGroupStringPlural = $localize`:@@publications:julkaisut`;
        break;
      }
      case 'dataset': {
        this.addFromPortalTabString = 'aineistoja';
        this.portalItemGroupStringPlural = $localize`:@@datasets:aineistot`;
        break;
      }
      case 'funding': {
        this.addFromPortalTabString = 'hankkeita';
        this.portalItemGroupStringPlural = $localize`:@@fundings:hankkeet`;
        break;
      }
    }

    this.portalItemGroupStringPlural =
      this.portalItemGroupStringPlural.toLowerCase();
  }

  checkAllSelected() {
    const fields = this.editorData.fields;

    const items = fields
      .filter((field) => !field.single)
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

    if (event.index === 0) {
      this.dialogActions = [...this.basicDialogActions];
      this.checkAllSelected();
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
          label: `Lisää valitut ${this.portalItemGroupStringPlural} tietoihini`,
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

    this.currentTabIndex = 0;

    /*
     * Create new field for recently imported items.
     * Add selected items into imported field if user decides to add more items.
     */
    const imported = group.fields.find((field) => field.id === 'imported');

    if (imported) {
      imported.items = imported.items.concat(selection);
    } else {
      group.fields.unshift({
        id: 'imported',
        label: label,
        items: selection,
      });
    }
  }
}
