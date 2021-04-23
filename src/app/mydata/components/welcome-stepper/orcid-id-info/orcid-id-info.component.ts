//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-orcid-id-info',
  templateUrl: './orcid-id-info.component.html',
  styleUrls: ['./orcid-id-info.component.scss'],
})
export class OrcidIdInfoComponent {
  @Input() userData: any;

  constructor() {}
}
