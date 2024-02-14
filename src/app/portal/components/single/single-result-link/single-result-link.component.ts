//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-single-result-link',
  templateUrl: './single-result-link.component.html',
  styleUrls: ['./single-result-link.component.scss'],
})
export class SingleResultLinkComponent {
  @Input() tag: string;
  @Input() icon: boolean;
  @Input() url: string;
  @Input() label: string;
  @Input() simple: boolean;
}
