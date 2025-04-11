//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { NgClass, NgIf, NgTemplateOutlet } from '@angular/common';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-tag-open-access',
    templateUrl: './tag-open-access.component.html',
    styleUrls: ['./tag-open-access.component.scss'],
    standalone: true,
  imports: [
    NgIf,
    NgTemplateOutlet,
    MatIcon,
    NgClass,
    SvgSpritesComponent
  ]
})
export class TagOpenAccessComponent implements OnInit {
  @Input() link: string;

  constructor() {}

  ngOnInit(): void {}
}
