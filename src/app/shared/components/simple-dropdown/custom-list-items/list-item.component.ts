import { FocusableOption } from '@angular/cdk/a11y';
import { Component, ElementRef, Input } from '@angular/core';

@Component({
  selector: 'my-list-item',
  host: {
    tabindex: '-1',
    role: 'list-item',
  },
  template: '{{ fruit }}',
})
export class ListItemComponent implements FocusableOption {
  @Input() fruit: string;
  disabled: boolean;

  constructor(private element: ElementRef) {
  }

  getLabel(): string {
    return this.fruit;
  }

  focus() {
    this.element.nativeElement.focus();
  }
}