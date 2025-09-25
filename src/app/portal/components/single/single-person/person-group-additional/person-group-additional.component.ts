// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { CheckEmptyFieldsPipe } from '../../../../pipes/check-empty-fields.pipe';
import { SingleResultLinkComponent } from '../../single-result-link/single-result-link.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-person-group-additional',
    templateUrl: './person-group-additional.component.html',
    styleUrls: ['./person-group-additional.component.scss'],
    imports: [
        NgIf,
        NgFor,
        SingleResultLinkComponent,
        CheckEmptyFieldsPipe,
    ]
})
export class PersonGroupAdditionalComponent implements OnInit {
  @Input() fields: any[];
  @Input() data: any;

  showAdditionalFields: boolean;

  constructor() {}

  ngOnInit(): void {}
}
