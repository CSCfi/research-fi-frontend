import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatchService {
  constructor() {}

  private groupSource = new BehaviorSubject<any>([]);
  patchGroups = this.groupSource.asObservable();

  private itemSource = new BehaviorSubject<any>([]);
  patchItems = this.itemSource.asObservable();

  currentPatchGroups = [];
  currentPatchItems = [];

  addToPatchGroups() {}

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

    console.log(this.currentPatchItems);

    this.itemSource.next(this.currentPatchItems);
  }

  removeItem(item) {
    console.log(item);
  }

  clearPatchPayload() {
    this.currentPatchItems = [];
  }
}
