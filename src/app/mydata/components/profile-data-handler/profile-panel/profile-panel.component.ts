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
  styleUrls: ['./profile-panel.component.scss'],
})
export class ProfilePanelComponent implements OnInit {
  @Input() dataSources: any;
  @Input() selectedSource: string;
  @Input() data: any;

  @Output() onGroupToggle = new EventEmitter<any>();
  @Output() onSingleItemToggle = new EventEmitter<any>();

  allSelected: boolean;

  checked: any[];
  mobileStatusSub: Subscription;

  fieldTypes = FieldTypes;

  checkGroupShow = checkGroupShow;

  /*
   * appSettingsService is used in Template
   */
  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit(): void {
    this.checked = [this.selectedSource];
    console.log(this.data);
  }

  toggleGroup(index: number) {
    // Check items
    //  this.data.fields[index].items.map((item) => (item.itemMeta.show = true));

    this.onGroupToggle.emit(index);
  }

  toggleItem(event, item, index) {
    const change = {
      index: index,
      itemMeta: {
        ...item.itemMeta,
        show: event.checked,
      },
    };

    this.onSingleItemToggle.emit(change);
  }
}
