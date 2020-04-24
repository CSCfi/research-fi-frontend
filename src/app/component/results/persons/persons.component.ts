//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-persons',
  templateUrl: '../persons/persons.component.html',
  styleUrls: ['./persons.component.scss']
})
export class PersonsComponent {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
}
