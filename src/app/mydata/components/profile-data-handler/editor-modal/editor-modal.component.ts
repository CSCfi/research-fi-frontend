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
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { checkSelected } from '../utils';
import { cloneDeep } from 'lodash-es';

@Component({
  selector: 'app-editor-modal',
  templateUrl: './editor-modal.component.html',
  styleUrls: ['./editor-modal.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class EditorModalComponent implements OnInit {
  editorData: any;
  originalEditorData: any;

  allSelected: boolean;

  primarySource: string;

  @Output() emitClose = new EventEmitter<boolean>();
  @Output() dataChange = new EventEmitter<object>();

  groupPayload: any[];
  itemPayload: any[];

  checkSelected = checkSelected;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditorModalComponent>
  ) {}

  ngOnInit(): void {
    this.editorData = this.data;
    this.originalEditorData = cloneDeep(this.data);
    this.primarySource = this.editorData.primarySource;

    this.allSelected = !!this.editorData.data.fields.some((field) =>
      field.groupItems.find((item) => item.groupMeta.show === false)
    )
      ? false
      : true;

    // Radio options have default values. Add these values on init
    this.addInitialOptions(this.editorData.data);
  }

  closeModal() {
    this.emitClose.emit(true);
  }

  addInitialOptions(data) {
    const radioGroups = data.fields.filter((field) => field.single);

    const patchGroups = [];
    const patchItems = [];

    radioGroups.forEach((group) =>
      group.groupItems.map((groupItem) => {
        if (groupItem.groupMeta.show) {
          patchGroups.push(groupItem.groupMeta);
          patchItems.push(
            groupItem.items.find((item) => item.itemMeta.show).itemMeta
          );
        }
      })
    );

    this.groupPayload = patchGroups;
    this.itemPayload = patchItems;
  }

  /*
   * Handle object add / remove from patch object list when values change
   */

  toggleGroup(response: {
    data: any;
    patchGroups: any[];
    patchItems: any[];
    index: string | number;
  }) {
    // console.log('response: ', response);

    // const currentItem = this.editorData.data.fields[response.index];
    // console.log(currentItem);
    // console.log(this.editorData.data.fields[index]);

    // currentItem.groupItems.map((item) => (item.groupMeta.show = true));

    // currentItem.groupMeta.show = !currentItem.groupMeta.show;

    // this.allSelected = !!this.editorData.data.fields.find(
    //   (item) => item.groupMeta.show === false
    // )
    //   ? false
    //   : true;

    const original = this.originalEditorData.data.fields[response.index];
    // console.log(
    //   'og: ',
    //   original.groupItems.map((groupItem) => groupItem.groupMeta)
    // );
    // console.log('response patchGroups: ', response.patchGroups);

    const originalGroupItemMeta = original.groupItems.map(
      (groupItem) => groupItem.groupMeta
    );

    originalGroupItemMeta.forEach((item) => {
      if (
        response.patchGroups.find(
          (group) => group.id === item.id && group.show === item.show
        )
      ) {
        this.removeFromPayload('group', item);
      } else {
        this.handlePatchObjectGroup(response.patchGroups, response.patchItems);
      }
    });
  }

  toggleRadio(response: {
    data: any;
    selectedGroup: any;
    selectedItem: any;
    index: string | number;
  }) {
    const original = this.originalEditorData.data.fields[response.index];

    const patchGroups = [];
    const patchObjects = [];

    const previousSelection = original.groupItems.find(
      (groupItem) => groupItem.groupMeta.show
    );

    // Add to patch items only if new selection
    if (
      previousSelection &&
      previousSelection.groupMeta.id !== response.selectedGroup.groupMeta.id
    ) {
      // Set original group show to false
      patchGroups.push({ ...previousSelection.groupMeta, show: false });

      // Set original item show to false
      previousSelection.items.forEach((item) =>
        patchObjects.push({ ...item.itemMeta, show: false })
      );

      // Set selected group
      patchGroups.push(response.selectedGroup.groupMeta);

      // Set selected item
      patchObjects.push(response.selectedItem.itemMeta);

      this.handlePatchRadioObject(patchGroups, patchObjects);
    }
  }

  toggleSingle(response: {
    groupId: number;
    itemMeta: any;
    index: string | number;
  }) {
    const parentGroup = this.editorData.data.fields[
      response.index
    ].groupItems.find((group) => group.groupMeta.id === response.groupId);

    const currentItem = parentGroup.items.find(
      (item) => item.itemMeta.id === response.itemMeta.id
    );

    currentItem.itemMeta.show = response.itemMeta.show;

    // Set group show to false if no selected items
    if (!parentGroup.items.find((item) => item.itemMeta.show)) {
      parentGroup.groupMeta.show = false;
      this.handlePatchObjectGroup([parentGroup.groupMeta], [response.itemMeta]);
    } else {
      // Add selection to patch items
      this.handlePatchSingleObject(response.itemMeta);
    }
  }

  toggleAll() {
    this.allSelected = true;

    this.editorData.data.fields.forEach((field) => {
      field.groupMeta.show = true;

      // this.handlePatchObjectGroup(field);
    });
  }

  /*
   * Remove from payload if value same as original
   */

  removeFromPayload(type, meta) {
    switch (type) {
      case 'group': {
        this.groupPayload = this.groupPayload.filter(
          (item) => item.id === meta.id
        );
      }
      case 'item': {
        this.itemPayload = this.itemPayload.filter(
          (item) => item.id === meta.id
        );
      }
    }
  }

  /*
   * Handle group & item meta data for patch operations
   */

  handlePatchObjectGroup(patchGroups: any[], patchObjects: any[]) {
    // Overwrite duplicates
    // console.log('patchGroups: ', patchGroups);
    // console.log('patchObjects: ', patchObjects);

    this.groupPayload = [...new Set([...this.groupPayload, ...patchGroups])];
    this.itemPayload = [...new Set([...this.itemPayload, ...patchObjects])];

    // console.log(this.groupPayload);

    // this.itemPayload.find((item) => item.id === currentItem.groupMeta.id)
    //   ? (this.itemPayload = this.itemPayload.filter(
    //       (item) => item.id !== currentItem.groupMeta.id
    //     ))
    //   : this.itemPayload.push(currentItem.groupMeta);
  }

  handlePatchRadioObject(patchGroups: any[], patchObjects: any[]) {
    // Overwrite existing patch items
    const patchObjectTypes = [
      ...new Set(patchObjects.map((object) => object.type)),
    ];

    this.itemPayload = this.itemPayload.filter(
      (object) => !patchObjectTypes.includes(object.type)
    );

    this.groupPayload = [...this.groupPayload, ...patchGroups];
    this.itemPayload = [...this.itemPayload, ...patchObjects];
  }

  handlePatchSingleObject(itemMeta) {
    this.itemPayload.find((item) => item.id === itemMeta.id)
      ? (this.itemPayload = this.itemPayload.filter(
          (item) => item.id !== itemMeta.id
        ))
      : this.itemPayload.push(itemMeta);

    // console.log(this.itemPayload);
  }

  saveChanges() {
    // console.log('save');
    console.log('groupPayload', this.groupPayload);
    console.log('itemPayload', this.itemPayload);
    // console.log(
    //   'itemPayload',
    //   this.itemPayload.filter((item) => item.show)
    // );

    this.dialogRef.close({
      data: this.editorData.data,
      patchGroups: this.groupPayload,
      patchItems: this.itemPayload,
    });

    // console.log('editedItems: ', this.editedItems);
    // this.editorData.dataChange.emit({
    //   data: this.editorData.data,
    //   patchItems: this.editedItems,
    // });
    // this.closeModal();
  }

  close() {
    this.dialogRef.close();
  }
}
