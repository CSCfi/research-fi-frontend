//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-panel-array-item',
  templateUrl: './panel-array-item.component.html',
})
export class PanelArrayItemComponent implements OnInit {
  @Input() item: any;
  @Input() fieldType: string;
  @Input() localized: boolean;

  fieldTypes = FieldTypes;

  locale: string;

  constructor(private appSettingsService: AppSettingsService) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {}
}
