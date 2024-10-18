//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';
import { IsUrlPipe } from '../../../../pipes/is-url.pipe';
import { SingleResultLinkComponent } from '../../single-result-link/single-result-link.component';
import { NgFor, NgIf } from '@angular/common';
import { MatCard, MatCardTitle } from '@angular/material/card';

@Component({
    selector: 'app-publication-links',
    templateUrl: './publication-links.component.html',
    standalone: true,
    imports: [
        MatCard,
        MatCardTitle,
        NgFor,
        NgIf,
        SingleResultLinkComponent,
        IsUrlPipe,
    ],
})
export class PublicationLinksComponent {
  @Input() item: any;
  @Input() linksFields: any[];
}
