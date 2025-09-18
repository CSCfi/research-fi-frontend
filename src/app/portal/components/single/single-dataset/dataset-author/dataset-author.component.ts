//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { OrcidComponent } from '../../../../../shared/components/orcid/orcid.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-dataset-author',
    templateUrl: './dataset-author.component.html',
    styleUrls: ['./dataset-author.component.scss'],
    imports: [
        NgIf,
        NgFor,
        OrcidComponent,
    ]
})
export class DatasetAuthorComponent implements OnInit {
  @Input() org: any;
  @Input() noLinks: boolean;

  constructor() {}

  ngOnInit(): void {}
}
