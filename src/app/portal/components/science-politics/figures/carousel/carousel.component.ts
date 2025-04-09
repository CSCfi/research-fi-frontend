// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, Input, OnChanges } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { CutContentPipe } from '../../../../../shared/pipes/cut-content.pipe';
import { RouterLink } from '@angular/router';
import { SecondaryButtonComponent } from '../../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { NgIf, NgFor } from '@angular/common';

@Component({
    selector: 'app-carousel',
    templateUrl: './carousel.component.html',
    styleUrls: ['./carousel.component.scss'],
    standalone: true,
    imports: [
        NgIf,
        SecondaryButtonComponent,
        RouterLink,
        NgFor,
        CutContentPipe,
    ],
})
export class CarouselComponent implements OnInit, OnChanges {
  @Input() data: any[];
  @Input() id: string;
  @Input() queryParams: any[];

  slicedData: any[];
  idx: number;
  maxIdx: number;
  currentLocale: string;

  next = $localize`:@@next:Seuraava`;
  previous = $localize`:@@previous:Edellinen`;

  constructor(private appSettingsService: AppSettingsService) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {}

  ngOnChanges() {
    this.maxIdx = this.data.length - 1;
    // Default to first item if no matching ID when filtering
    this.idx = this.data.find((x) => x.id === this.id)
      ? this.data.findIndex((x) => x.id === this.id)
      : 0;
    this.slicedData = this.sliceAround(this.idx, this.maxIdx, this.data);
  }

  sliceAround(idx: number, maxIdx: number, arr: any[]) {
    let res = [];
    if (idx > 0 && idx < maxIdx) {
      res = arr.slice(idx - 1, idx + 2);
    } else if (idx === 0) {
      res = arr.slice(0, 3);
    } else if (idx === maxIdx) {
      res = arr.slice(idx - 2);
    }
    return res;
  }
}
