// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-person-group-additional',
  templateUrl: './person-group-additional.component.html',
  styleUrls: ['./person-group-additional.component.scss'],
})
export class PersonGroupAdditionalComponent implements OnInit {
  @Input() fields: any[];
  @Input() data: any;

  showAdditionalFields: boolean;

  constructor() {}

  ngOnInit(): void {}
}
