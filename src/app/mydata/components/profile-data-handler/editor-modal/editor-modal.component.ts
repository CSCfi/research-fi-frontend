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

  groupPayload = [];
  itemPayload = [];
  publicationPayload: any[];

  checkSelected = checkSelected;

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<EditorModalComponent>
  ) {}

  ngOnInit(): void {
    this.editorData = this.data;
    this.originalEditorData = cloneDeep(this.data);
    this.primarySource = this.editorData.primarySource;

    this.checkAllSelected();

    // Radio options have default values. Add these values on init
    // this.addInitialOptions(this.editorData.data);
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

  checkAllSelected() {
    const fields = this.editorData.data.fields;

    // Single selections are handled on init
    this.allSelected = !!fields
      .filter((field) => !field.single)
      .some((field) =>
        field.groupItems.find((item) => item.groupMeta.show === false)
      )
      ? false
      : true;
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
    // Compare response with original values. Patch only if change on value
    const original = this.originalEditorData.data.fields[response.index];

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

    this.checkAllSelected();
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

    const publications =
      this.editorData.data.fields[response.index].selectedPublications;

    currentItem.itemMeta = response.itemMeta;

    // Set group show to false if no selected items
    if (
      !parentGroup.items.find((item) => item.itemMeta.show) &&
      !publications?.find((item) => item.show)
    ) {
      parentGroup.groupMeta.show = false;
      this.handlePatchObjectGroup([parentGroup.groupMeta], [response.itemMeta]);
    } else {
      // Add selection to patch items
      this.handlePatchSingleObject(response.itemMeta);
    }
  }

  togglePrimaryValue(patchObjects) {
    [...this.itemPayload, ...patchObjects];
  }

  togglePublication() {
    // TODO: Find if there's need for this method.
    // Fetched publications could be handled as now without this method.
  }

  toggleAll() {
    this.allSelected = true;

    // Change detection won't work if nested properties change
    const copy = cloneDeep(this.editorData);
    const data = copy.data.fields;
    this.editorData = {};

    const patchGroups = [];
    const patchItems = [];

    data.forEach((field) => {
      if (field.selectedPublications)
        field.selectedPublications.map((item) => (item.show = true));

      field.groupItems.map((groupItem) => {
        groupItem.groupMeta.show = true;

        // Single selections should always have show as true. Therefore these items shouldn't be altered
        if (!field.single) {
          patchGroups.push(groupItem.groupMeta);
          groupItem.items.map((item) => {
            item.itemMeta.show = true;
            patchItems.push(item.itemMeta);
          });
        }
      });
    });

    this.editorData = copy;

    this.handlePatchObjectGroup(patchGroups, patchItems);
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

  handlePatchObjectGroup(patchGroups: any[], patchItems: any[]) {
    // TODO: Better check for duplicates. Add only latest changes
    // this.groupPayload = [...new Set([...this.groupPayload, ...patchGroups])];
    // this.itemPayload = [...new Set([...this.itemPayload, ...patchItems])];
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
  }

  saveChanges() {
    this.dialogRef.close({
      data: this.editorData.data,
      patchGroups: this.groupPayload,
      patchItems: this.itemPayload,
      patchPublications:
        this.editorData.data.fields[0].selectedPublications?.filter(
          (item) => item.show
        ),
    });
  }

  close() {
    this.dialogRef.close();
  }
}
