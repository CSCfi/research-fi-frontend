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

  /*
   * appSettingsService is used in Template
   */
  constructor(private appSettingsService: AppSettingsService) {}

  ngOnInit(): void {
    this.checked = [this.selectedSource];
  }

  toggleGroup(index: number) {
    this.onGroupToggle.emit(index);
    this.data.fields[index].items.map((item) => (item.itemMeta.show = true));
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
