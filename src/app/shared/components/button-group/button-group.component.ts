//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnChanges, ViewEncapsulation } from '@angular/core';
import { MatRadioGroup, MatRadioButton } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgFor, NgIf } from '@angular/common';
import { MatButtonToggleGroup, MatButtonToggle } from '@angular/material/button-toggle';

@Component({
    selector: 'app-button-group',
    templateUrl: './button-group.component.html',
    styleUrls: ['./button-group.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        MatButtonToggleGroup,
        NgFor,
        MatButtonToggle,
        NgIf,
        MatCheckbox,
        MatRadioGroup,
        MatRadioButton,
    ],
})
export class ButtonGroupComponent {
  @Input() multiple: boolean;
  @Input() vertical: boolean;
  @Input() data: any[];
  @Input() name: string;
  @Input() ariaLabel: string;
  @Input() checked: any[];

  constructor() {}
}
