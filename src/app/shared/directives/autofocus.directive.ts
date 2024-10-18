// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { AfterContentInit, Directive, ElementRef, Input } from '@angular/core';

@Directive({
    selector: '[autoFocus]',
    standalone: true,
})
export class AutofocusDirective implements AfterContentInit {
  @Input() public appAutoFocus: boolean;
  @Input() public trigger: number;

  public constructor(private el: ElementRef) {}

  public ngAfterContentInit() {
    const element = this.el.nativeElement;

    setTimeout(() => {
      element.focus();

      /*
       * Material checkbox keyboard focus indicator works with additional css class.
       * This differs from mouse / programmatic focus.
       *
       * 200ms timer goes past dialog autofocus.
       *
       * mouseEvent.detail is used to check which input triggers the view that holds
       * the checkbox that needs to be focused.
       * 0 is keyboard and 1 is mouse.
       */
      if (
        this.trigger === 0 &&
        element.classList.contains('mat-checkbox') &&
        !element.classList.contains('mat-checkbox-disabled')
      ) {
        element.classList.add('cdk-keyboard-focused');
      }
    }, 200);
  }
}
