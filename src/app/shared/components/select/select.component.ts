// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { MatOption } from '@angular/material/core';
import { MatSelect } from '@angular/material/select';
import { MatFormField, MatLabel } from '@angular/material/form-field';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-select',
    templateUrl: './select.component.html',
    styleUrls: ['./select.component.scss'],
    encapsulation: ViewEncapsulation.None,
    standalone: true,
    imports: [
        NgIf,
        MatFormField,
        MatLabel,
        MatSelect,
        NgFor,
        MatOption,
    ],
})
export class SelectComponent implements OnInit {
  @Input() options: any[];
  @Input() label: string;
  @Input() labelBefore: boolean;
  @Input() defaultToFirst: boolean;

  @Output() onSelectionChange = new EventEmitter<any>();

  selectedOption: string;

  constructor() {}

  ngOnInit(): void {
    this.selectedOption = this.defaultToFirst ? this.options[0] : null;
  }

  selectOption(event) {
    const option = event.value;

    this.selectedOption = option;
    this.onSelectionChange.emit(option);
  }
}
