//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-mydata-beta-info',
  templateUrl: './mydata-beta-info.component.html',
  styleUrls: ['./mydata-beta-info.component.scss'],
})
export class MydataBetaInfoComponent implements OnInit {
  @Input() template: TemplateRef<any>;
  @Input() showCloseButton: boolean;

  open = true;

  constructor() {}

  ngOnInit(): void {}

  toggle() {
    this.open = !this.open;
  }
}
