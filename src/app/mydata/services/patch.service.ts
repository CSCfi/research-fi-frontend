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
  confirmedPayLoad = [];
  publicationsToPatch = [];
  publicationsToRemove = [];

  private confirmedPayloadSource = new BehaviorSubject<any>([]);
  currentPatchItems = this.confirmedPayloadSource.asObservable();

  addToPayload(payload) {
    const items = this.patchItems;

    if (Array.isArray(payload)) {
      const patchItemArr = items.concat(payload);

      this.patchItems = [
        ...new Map(patchItemArr.map((item) => [item.id, item])).values(),
      ];
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
    console.log('confirm called', this.confirmedPayLoad, this.patchItems);
    if (this.confirmedPayLoad.length > 0) {
      for (let i = 0; i < this.confirmedPayLoad.length; i += 1) {
        for (let j = 0;  j < this.patchItems.length; j += 1) {
          if (this.confirmedPayLoad[i].id === this.patchItems[j].id){
            this.confirmedPayLoad[i] = this.patchItems[j];
            this.patchItems.splice(j, 1);
          }
        };
      }
    }
    this.confirmedPayLoad = this.confirmedPayLoad.concat(this.patchItems);
    this.patchItems = [];
    this.confirmedPayloadSource.next(this.confirmedPayLoad);
  }

  cancelConfirmedPayload() {
    this.confirmedPayLoad = [];
    this.confirmedPayloadSource.next([]);
  }

  removeItem(id) {
    this.patchItems = this.patchItems.filter((item) => item.id !== id);
  }

  removeItemsWithType(type) {
    this.patchItems = this.patchItems.filter((item) => item.type !== type);
    this.confirmedPayLoad = this.confirmedPayLoad.filter(
      (item) => item.type !== type
    );
  }

  clearPayload() {
    this.patchItems = [];
  }
}
