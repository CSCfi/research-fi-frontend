//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  EventEmitter,
  Inject,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { checkSelected } from '../utils';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorModalComponent implements OnInit {
  editorData: any;
  editLabel: string;
  // @Input() data: any;
  // @Input() dataSources: any;
  // @Input() editLabel: string;

  allSelected: boolean;

  selectedSource: string;

  @Output() emitClose = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<object>();

  editedItems: any[] = [];

  checkSelected = checkSelected;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditorModalComponent>
  ) {}

  ngOnInit(): void {
    console.log(this.data);
    this.editorData = this.data;
    this.editLabel = this.data.editLabel;

    this.selectedSource = this.editorData.dataSources[0];

    this.allSelected = !!this.editorData.data.fields.some((field) =>
      field.groupItems.find((item) => item.groupMeta.show === false)
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

  changeGroup(index) {
    const currentItem = this.editorData.data.fields[index];

    currentItem.groupMeta.show = !currentItem.groupMeta.show;

    this.allSelected = !!this.editorData.data.fields.find(
      (item) => item.groupMeta.show === false
    )
      ? false
      : true;

    this.handlePatchObjectGroup(currentItem);
  }

  changeSingle(res) {
    const currentItem = this.editorData.data.fields[res.index].items.find(
      (item) => item.itemMeta.id === res.itemMeta.id
    );

    currentItem.itemMeta = res.itemMeta;

    this.handlePatchSingleObject(res.itemMeta);
  }

  toggleAll() {
    this.allSelected = true;

    this.editorData.data.fields.forEach((field) => {
      field.groupMeta.show = true;

      this.handlePatchObjectGroup(field);
    });
  }

  handlePatchObjectGroup(currentItem) {
    this.editedItems.find((item) => item.id === currentItem.groupMeta.id)
      ? (this.editedItems = this.editedItems.filter(
          (item) => item.id !== currentItem.groupMeta.id
        ))
      : this.editedItems.push(currentItem.groupMeta);
  }

  handlePatchSingleObject(currentItem) {
    this.editedItems.find((item) => item.id === currentItem.id)
      ? (this.editedItems = this.editedItems.filter(
          (item) => item.id !== currentItem.id
        ))
      : this.editedItems.push(currentItem);
  }

  saveChanges() {
    console.log('editedItems: ', this.editedItems);
    this.editorData.dataChange.emit({
      data: this.editorData.data,
      patchItems: this.editedItems,
    });
    this.closeModal();
  }

  close() {
    this.dialogRef.close();
  }
}
