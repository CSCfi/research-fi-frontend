//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit, Input } from '@angular/core';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-orcid',
    templateUrl: './orcid.component.html',
    styleUrls: ['./orcid.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        NgTemplateOutlet,
        FontAwesomeModule,
    ],
})
export class OrcidComponent implements OnInit {
  @Input() orcid: string;

  constructor() {}

  ngOnInit() {}
}
