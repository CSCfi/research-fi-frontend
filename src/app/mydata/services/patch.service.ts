//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatchService {
  constructor() {}

  private itemSource = new BehaviorSubject<any>([]);
  patchItems = this.itemSource.asObservable();

  currentPatchItems = [];

  addToPatchItems(payload) {
    const patchItems = this.currentPatchItems;

    if (Array.isArray(payload)) {
      this.currentPatchItems = patchItems.concat(payload);
    } else {
      const duplicate = patchItems.find(
        (patchItem) => patchItem.id === payload.id
      );

      duplicate
        ? duplicate.show === payload.show
          ? (this.currentPatchItems[patchItems.indexOf(duplicate)] = payload)
          : (this.currentPatchItems = patchItems.filter(
              (patchItem) => patchItem.id !== payload.id
            ))
        : this.currentPatchItems.push(payload);
    }

    this.itemSource.next(this.currentPatchItems);
  }

  removeItem(id) {
    this.currentPatchItems = this.currentPatchItems.filter(
      (item) => item.id !== id
    );
  }

  removeItemsWithType(type) {
    this.currentPatchItems = this.currentPatchItems.filter(
      (item) => item.type !== type
    );
  }

  clearPatchPayload() {
    this.currentPatchItems = [];
  }
}
