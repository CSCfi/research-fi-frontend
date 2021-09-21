//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';
import { PatchService } from '@mydata/services/patch.service';

@Component({
  selector: 'app-primary-badge',
  templateUrl: './primary-badge.component.html',
  styleUrls: ['./primary-badge.component.scss'],
})
export class PrimaryBadgeComponent {
  @Input() label: string;
  @Input() selected: boolean;
  @Input() item: any;
  @Input() data: any;
  @Input() disabled: boolean;
  @Input() disableClick: boolean;

  constructor(private patchService: PatchService) {}

  togglePrimary() {
    const currentItemMeta = this.item.itemMeta;

    const selectedItems = this.data.groupItems
      .map((groupItem) =>
        groupItem.items
          .map((item) => item)
          .filter((item) => item.itemMeta.primaryValue)
      )
      .flat();

    // Primary selections is limited to 3. Remove older selection.
    if (selectedItems.length === 3 && !currentItemMeta.primaryValue) {
      selectedItems[0].itemMeta.primaryValue = false;
    }

    currentItemMeta.primaryValue = !currentItemMeta.primaryValue;

    this.patchService.addToPatchItems(this.item.itemMeta);
  }
}
