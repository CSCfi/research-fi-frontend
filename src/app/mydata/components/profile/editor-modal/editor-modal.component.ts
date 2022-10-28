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

  @ViewChild('selectAllCheckbox') selectAllCheckbox: MatCheckbox;

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

    this.checkAllSelected();
  }

  checkAllSelected() {
    const fields = this.editorData.fields;

    const items = fields
      .filter((field) => !field.single)
      .flatMap((field) => field.items);

    this.toggleAllDisabled = items.length === 0;

    this.allSelected = !!!items.some((item) => !item.itemMeta.show);

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
      }
    }

    this.onEditorClose.emit(null); // close component wrapper from parent
    this.showDialog = false;
  }
}
