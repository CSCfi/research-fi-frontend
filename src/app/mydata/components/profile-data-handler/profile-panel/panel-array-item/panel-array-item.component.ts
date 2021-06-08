//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';

@Component({
  selector: 'app-panel-array-item',
  templateUrl: './panel-array-item.component.html',
})
export class PanelArrayItemComponent {
  @Input() item: any;
  @Input() fieldType: string;

  fieldTypes = FieldTypes;

  constructor() {}
}
