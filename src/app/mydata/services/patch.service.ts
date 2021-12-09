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

  patchItems = [];
  confirmedPatchItems = [];
  publicationsToPatch = [];
  publicationsToRemove = [];

  private confirmedPatchItemsSource = new BehaviorSubject<any>([]);
  currentPatchItems = this.confirmedPatchItemsSource.asObservable();

  addToPayload(payload) {
    const items = this.patchItems;

    if (Array.isArray(payload)) {
      this.patchItems = items.concat(payload);
    } else {
      const duplicate = items.find((patchItem) => patchItem.id === payload.id);

      duplicate
        ? duplicate.show === payload.show
          ? (this.patchItems[items.indexOf(duplicate)] = payload)
          : (this.patchItems = items.filter(
              (patchItem) => patchItem.id !== payload.id
            ))
        : this.patchItems.push(payload);
    }
  }

  confirmPayload() {
    const patchItems = this.patchItems;

    let merged = this.confirmedPatchItems.concat(patchItems);

    // If user decides to deselect already confirmed item
    patchItems.forEach((item) => {
      if (merged.filter((mergedItem) => mergedItem.id === item.id).length > 1) {
        merged = merged.filter((mergedItem) => mergedItem.id !== item.id);
      }
    });

    this.patchItems = [];
    this.confirmedPatchItems = merged;
    this.confirmedPatchItemsSource.next(merged);
  }

  cancelConfirmedPayload() {
    this.confirmedPatchItems = [];
    this.confirmedPatchItemsSource.next([]);
  }

  removeItem(id) {
    this.patchItems = this.patchItems.filter((item) => item.id !== id);
  }

  removeItemsWithType(type) {
    this.patchItems = this.patchItems.filter((item) => item.type !== type);
    this.confirmedPatchItems = this.confirmedPatchItems.filter(
      (item) => item.type !== type
    );
  }

  clearPayload() {
    this.patchItems = [];
  }
}
