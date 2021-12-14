//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { ChangeDetectorRef, Component, Input, OnInit } from '@angular/core';
import { sortItemsBy } from '@mydata/utils';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-summary-datasets',
  templateUrl: './summary-datasets.component.html',
})
export class SummaryDatasetsComponent implements OnInit {
  @Input() data: any;
  @Input() fieldTypes: any;

  sortItemsBy = sortItemsBy;
  sortedItems: any[];

  itemDisplayCount = 3;

  constructor(
    private appSettingsService: AppSettingsService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    const locale = this.appSettingsService.capitalizedLocale;
    // Map items from profile API
    // TODO: Handle in model
    let items = this.data.groupItems[0].items;

    items.map((item) => {
      if (item['name' + locale]) {
        item.title = item['name' + locale];
      }
    });

    this.data.groupItems[0].items = items.filter(
      (item) => item.itemMeta.id !== -1
    );

    this.sortedItems = this.sortItemsBy(this.data, 'year').filter(
      (item) => item.itemMeta.show
    );

    this.cdr.detectChanges();
  }

  showAllItems() {
    this.itemDisplayCount = this.sortedItems.length;
  }
}
