//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { checkSelected } from '../../utils';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
})
export class EditorModalComponent implements OnInit {
  @Input() data: any;
  @Input() dataSources: any;

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

  changeData(index) {
    // TODO: Remove item if duplicate
    this.editedItems.push(this.data.fields[index].items[0].itemMeta);

    this.data.fields[index].groupMeta.show =
      !this.data.fields[index].groupMeta.show;

    this.allSelected = !!this.data.fields.find(
      (item) => item.groupMeta.show === false
    )
      ? false
      : true;
  }

  toggleAll() {
    this.data.fields.forEach((item) => (item.groupMeta.show = true));
  }

  saveChanges() {
    this.dataChange.emit({ data: this.data, patchItems: this.editedItems });
    this.closeModal();
  }
}
