//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { ParseDatePipe } from '../../../../pipes/parse-date.pipe';
import { GetLocalizedValuesPipe } from '../../../../pipes/getLocalizedValues.pipe';
import { ActivityItemComponent } from '../activity-item/activity-item.component';
import { NgIf, NgSwitch, NgSwitchCase, NgFor, NgTemplateOutlet, NgSwitchDefault, NgClass } from '@angular/common';

@Component({
    selector: 'app-panel-array-item',
    templateUrl: './panel-array-item.component.html',
    styleUrls: ['./panel-array-item.component.scss'],
    standalone: true,
  imports: [
    NgIf,
    NgSwitch,
    NgSwitchCase,
    NgFor,
    ActivityItemComponent,
    NgTemplateOutlet,
    NgSwitchDefault,
    GetLocalizedValuesPipe,
    ParseDatePipe,
    NgClass
  ]
})
export class PanelArrayItemComponent implements OnInit {
  @Input() set item(item: any) {
    this._item = item;
  }
  @Input() fieldType: number;
  @Input() localized: boolean;
  @Input() summary: boolean;
  hasOpenScienceTag = false;
  linkToPublication = undefined;

  fieldTypes = FieldTypes;
  _item: any;

  isContentLocalized = false;
  locale: string;

  constructor(private appSettingsService: AppSettingsService) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this._item?.dataSources?.forEach(ds => {
      console.log('ds', ds);
      if (ds.registeredDataSource !== 'ORCID') {
        this.linkToPublication = this._item?.publicationId;
      }
      }
    );
  }
}
