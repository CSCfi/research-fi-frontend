import { Component, HostBinding, Input } from '@angular/core';
import { Highlightable } from '@angular/cdk/a11y';

@Component({
    selector: 'app-list-item',
    template: `<div [class.disabled]="disabled">
    <ng-content></ng-content>
  </div>`,
    standalone: true,
})
export class ListItemComponent implements Highlightable {
  @Input() id;
  @Input() doc;
  @Input() term;
  @Input() historyItem;
  @Input() clear;
  @Input() empty;
  @Input() disabled = false;
  private activeStatus = false;

  @HostBinding('class.active') get isActive() {
    return this.activeStatus;
  }

  setActiveStyles() {
    this.activeStatus = true;
  }

  setInactiveStyles() {
    this.activeStatus = false;
  }

  getLabel() {
    return (
      this.id +
      this.doc +
      this.term +
      this.historyItem +
      this.clear +
      this.empty
    );
  }
}
