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
  ViewEncapsulation,
} from '@angular/core';
import { checkSelected } from '@mydata/utils';
import { cloneDeep } from 'lodash-es';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorModalComponent implements OnInit {
  @Input() data: any;
  showDialog: boolean;
  editorData: any;
  originalEditorData: any;

  allSelected: boolean;
  toggleAllDisabled: boolean = false;

  primarySource: string;

  @Output() emitClose = new EventEmitter<boolean>();
  @Output() onEditorClose = new EventEmitter<any>();

  publicationPayload: any[];

  checkSelected = checkSelected;

  patchPayload = [];

  dialogActions = [
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: $localize`:@@continue:Jatka`, primary: true, method: 'save' },
  ];

  constructor(
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService
  ) {}

  ngOnInit(): void {
    this.showDialog = true;
    this.editorData = this.data;
    this.originalEditorData = cloneDeep(this.data);
    this.primarySource = this.editorData.primarySource;

    this.checkAllSelected();

    // Radio options have default values. Add these values on init
    // this.addInitialOptions(this.editorData.data);
  }

  // Not in use
  addInitialOptions(data) {
    const radioGroups = data.fields.filter((field) => field.single);

    const patchItems = [];

    radioGroups.forEach((group) =>
      group.groupItems.map((groupItem) => {
        if (groupItem.groupMeta.show) {
          patchItems.push(
            groupItem.items.find((item) => item.itemMeta.show).itemMeta
          );
        }
      })
    );

    this.patchService.addToPayload(patchItems);
  }

  checkAllSelected() {
    const fields = this.editorData.fields;

    const items = fields
      .filter((field) => !field.single)
      .flatMap((field) => field.groupItems)
      .flatMap((groupItem) => groupItem.items);

    this.toggleAllDisabled = items.length === 0

    this.allSelected = !!!items.some((item) => item.itemMeta.show === false);
  }

  checkSomeSelected() {
    const fields = this.editorData.fields;

    const items = fields
      .filter((field) => !field.single)
      .flatMap((field) => field.groupItems)
      .flatMap((groupItem) => groupItem.items);

    if (!this.allSelected)
      return !!items.some((item) => item.itemMeta.show === true);
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

      field.groupItems.map((groupItem) => {
        // Single selections should always have show as true. Therefore these items shouldn't be altered
        if (!field.single) {
          groupItem.items.map((item) => {
            item.itemMeta.show = event.checked;
            patchItems.push(item.itemMeta);
          });
        }
      });
    });

    this.editorData = { ...copy };

    this.patchService.addToPayload(patchItems);
  }

  doDialogAction(action: string) {
    switch(action) {
      case "save": {
        this.patchService.confirmPayload();
        this.publicationsService.confirmPayload();
        this.datasetsService.confirmPayload();
        this.fundingsService.confirmPayload();

        return this.onEditorClose.emit(this.editorData)
      }
      case "cancel": {
        this.patchService.clearPayload();
        this.publicationsService.clearPayload();
        this.publicationsService.clearDeletables();
      }
    }

    this.onEditorClose.emit(null) // close component wrapper from parent
    this.showDialog = false
  }
}
