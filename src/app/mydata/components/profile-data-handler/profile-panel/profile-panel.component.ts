//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { checkGroupShow } from '../utils';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
})
export class ProfilePanelComponent implements OnInit {
  @Input() dataSources: any;
  @Input() primarySource: string;
  @Input() data: any;

  @Output() onGroupToggle = new EventEmitter<any>();
  @Output() onRadioItemToggle = new EventEmitter<any>();
  @Output() onSingleItemToggle = new EventEmitter<any>();
  @Output() onPrimaryValueChange = new EventEmitter<any>();

  allSelected: boolean;

  mobileStatusSub: Subscription;

  fieldTypes = FieldTypes;

  checkGroupShow = checkGroupShow;

  openPanels = [];

  // TODO: Dynamic locale
  locale = 'Fi';

  /*
   * appSettingsService is used in Template
   */
  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit(): void {
    this.setDefaultPrimaryValue(this.data.fields);
  }

  setDefaultPrimaryValue(data) {
    // Set default only if primary value is not set
    data.map((group) => {
      if (group.hasPrimaryValue) {
        const groupItems = group.groupItems.map((groupItem) => groupItem.items);
        const itemArr = [].concat.apply([], groupItems);

        if (!itemArr.some((item) => item.itemMeta.primaryValue === true))
          group.groupItems[0].items[0].itemMeta.primaryValue = true;
      }
    });
  }

  setPrimaryValue(option, data) {
    const patchItems = [];

    data.groupItems.map((groupItem) =>
      groupItem.items.forEach((item) => {
        // Set default primary value to false
        if (item.itemMeta.primaryValue === true) {
          item.itemMeta.primaryValue = false;
          patchItems.push(item.itemMeta);
        }

        // Set selected primary value and add to patch items
        if (item.itemMeta.id === option.id) {
          // Check item if chosen item isn't selected
          if (!item.itemMeta.show) item.itemMeta.show = true;

          item.itemMeta.primaryValue = true;
          patchItems.push(item.itemMeta);
        }
      })
    );

    this.onPrimaryValueChange.emit(patchItems);
  }

  toggleGroup(event: any, index: number, data: any) {
    const patchGroups = [];
    const patchItems = [];

    this.openPanels.includes(index)
      ? (this.openPanels = this.openPanels.filter((item) => item !== index))
      : this.openPanels.push(index);

    data.groupItems.map((groupItem) => {
      groupItem.groupMeta.show = event.checked;
      patchGroups.push(groupItem.groupMeta);

      groupItem.items.map((item) => {
        item.itemMeta.show = event.checked;
        patchItems.push(item.itemMeta);
      });
    });

    this.onGroupToggle.emit({
      data: data,
      patchGroups: patchGroups,
      patchItems: patchItems,
      index: index,
    });
  }

  toggleRadioItem(event, index) {
    let selectedItem = {};

    const fields = this.data.fields[index];

    fields.groupItems.map((groupItem) => {
      const currentSelection = groupItem.items.find(
        (item) => item.itemMeta.id === event.value
      );

      if (currentSelection) selectedItem = currentSelection;

      groupItem.groupMeta.show = currentSelection ? true : false;

      groupItem.items.map(
        (item) =>
          (item.itemMeta.show = item.itemMeta.id === event.value ? true : false)
      );
    });

    this.onRadioItemToggle.emit({
      data: fields,
      selectedGroup: fields.groupItems.find(
        (groupItem) => groupItem.groupMeta.show
      ),
      selectedItem: selectedItem,
      index: index,
    });
  }

  toggleItem(event, groupItem, item, index) {
    if (item.itemMeta.primaryValue && !event.checked) {
      item.itemMeta.primaryValue = false;
      this.setDefaultPrimaryValue(this.data.fields);
    }

    this.onSingleItemToggle.emit({
      index: index,
      groupId: groupItem.groupMeta.id,
      itemMeta: {
        ...item.itemMeta,
        show: event.checked,
      },
    });
  }
}
