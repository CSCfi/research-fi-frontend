//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-publication-links',
  templateUrl: './publication-links.component.html',
})
export class PublicationLinksComponent implements OnInit {
  @Input() item: any;
  @Input() linksFields: any;

  constructor() {}

  ngOnInit(): void {}
}
