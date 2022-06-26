//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-single-result-link',
  templateUrl: './single-result-link.component.html',
  styleUrls: ['./single-result-link.component.scss'],
})
export class SingleResultLinkComponent implements OnInit {
  @Input() tag: string;
  @Input() icon: boolean;
  @Input() url: string;
  @Input() label: string;

  constructor() {}

  ngOnInit(): void {}

  fixExternalUrl(url: string) {
    // Fix url address to be handled as external link if prefix missing
    return url.startsWith('http')
      ? url
      : url.startsWith('www')
      ? 'https://' + url
      : '//' + url;
  }
}
