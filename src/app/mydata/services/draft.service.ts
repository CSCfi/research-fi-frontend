import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class DraftService {
  draftData: any = null;

  constructor() {}

  handleSave(data) {
    console.log(data);
    this.draftData = data;
  }

  clearData() {
    this.draftData = null;
  }
}
