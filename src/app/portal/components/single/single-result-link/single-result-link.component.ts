//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input } from '@angular/core';
import { FixExternalUrlPipe } from '../../../pipes/fix-external-url.pipe';
import { TrimLinkPrefixPipe } from '../../../../shared/pipes/trim-link-prefix.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-single-result-link',
    templateUrl: './single-result-link.component.html',
    styleUrls: ['./single-result-link.component.scss'],
    standalone: true,
  imports: [
    NgIf,
    FontAwesomeModule,
    TrimLinkPrefixPipe,
    FixExternalUrlPipe,
    SvgSpritesComponent
  ]
})
export class SingleResultLinkComponent {
  @Input() tag: string;
  @Input() icon: boolean;
  @Input() url: string;
  @Input() label: string;
  @Input() simple: boolean;
}
