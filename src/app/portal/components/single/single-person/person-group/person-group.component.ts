// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { CheckEmptyFieldsPipe } from '../../../../pipes/check-empty-fields.pipe';
import { PersonGroupAdditionalComponent } from '../person-group-additional/person-group-additional.component';
import { RouterLink } from '@angular/router';
import { TagDoiComponent } from '../../../../../shared/components/tags/tag-doi/tag-doi.component';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-person-group',
    templateUrl: './person-group.component.html',
    styleUrls: ['./person-group.component.scss'],
    imports: [
        NgFor,
        NgIf,
        TagDoiComponent,
        RouterLink,
        PersonGroupAdditionalComponent,
        CheckEmptyFieldsPipe,
    ]
})
export class PersonGroupComponent implements OnInit {
  @Input() label: string;
  @Input() data: any[];
  @Input() fields: any[];
  @Input() maxItemCount: number;
  @Input() tab: string;
  @Input() additionalFields: any[];

  constructor() {}

  ngOnInit(): void {}
}
