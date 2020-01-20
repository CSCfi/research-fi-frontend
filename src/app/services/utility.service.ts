import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilityService {

  constructor() { }

  modalOpen = false;

  // source: https://github.com/valor-software/ngx-bootstrap/issues/1819#issuecomment-556373372

  // prevent SHIFT+TAB so we can't go back from FIRST tab-able element outside a modal dialog
  // add this to the first tab-able element in template:  (keydown)="preventTabBack($event)"
  // condition is optional for cases where a button may not be last focusable element, for instance
  // an invalid form making submit button disabled
  static preventTabBack(event, condition?) {
    if (condition === undefined || condition) {
        if (event.shiftKey && event.keyCode === 9) {
            // shift was down when tab was pressed
            event.preventDefault();
        }
    }
  }
  // prevent TAB so we can't go beyond LAST tab-able element outside a modal dialog
  // add this to the last tab-able element in template:  (keydown)="preventTab($event)"
  // condition is optional for cases where a button may not be last focusable element, for instance
  // an invalid form making submit button disabled
  static preventTab(event, condition?) {
    if (condition === undefined || condition) {
        if (!event.shiftKey && event.keyCode === 9) {
            // shift was NOT down when tab was pressed
            event.preventDefault();
        }
    }
  }
}
