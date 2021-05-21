//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { checkSelected } from '../../welcome-stepper/utils';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
})
export class EditorModalComponent implements OnInit {
  @Input() data: any;
  @Input() dataSources: any;
  @Input() editLabel: string;

  allSelected: boolean;

  selectedSource: string;

  @Output() emitClose = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<object>();

  editedItems: any[] = [];

  checkSelected = checkSelected;

  constructor() {}

  ngOnInit(): void {
    this.selectedSource = this.dataSources[0];

    this.allSelected = !!this.data.fields.find(
      (item) => item.groupMeta.show === false
    )
      ? false
      : true;
  }

  closeModal() {
    this.emitClose.emit(true);
  }

  /*
   * Handle object add / remove from patch object list when values change
   */

  changeData(index) {
    const currentItem = this.data.fields[index];

    this.handlePatchObject(currentItem);

    currentItem.groupMeta.show = !currentItem.groupMeta.show;

    this.allSelected = !!this.data.fields.find(
      (item) => item.groupMeta.show === false
    )
      ? false
      : true;
  }

  toggleAll() {
    this.allSelected = true;

    this.data.fields.forEach((field) => {
      field.groupMeta.show = true;

      this.handlePatchObject(field);
    });
  }

  handlePatchObject(currentItem) {
    this.editedItems.find((item) => item.id === currentItem.groupMeta.id)
      ? (this.editedItems = this.editedItems.filter(
          (item) => item.id !== currentItem.groupMeta.id
        ))
      : this.editedItems.push(currentItem.groupMeta);
  }

  saveChanges() {
    this.dataChange.emit({ data: this.data, patchItems: this.editedItems });
    this.closeModal();
  }
}
