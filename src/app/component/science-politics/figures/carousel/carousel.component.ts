// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import {
  Component,
  OnInit,
  Input,
  OnChanges,
  Inject,
  LOCALE_ID,
} from '@angular/core';
import {
  faAngleDoubleRight,
  faAngleDoubleLeft,
} from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss'],
})
export class CarouselComponent implements OnInit, OnChanges {
  @Input() data: any[];
  @Input() id: string;
  @Input() queryParams: any[];

  slicedData: any[];
  idx: number;
  maxIdx: number;
  currentLocale: string;
  faAngleDoubleRight = faAngleDoubleRight;
  faAngleDoubleLeft = faAngleDoubleLeft;

  next = $localize`:@@next:Seuraava`;
  previous = $localize`:@@previous:Edellinen`;

  constructor(@Inject(LOCALE_ID) protected localeId: string) {
    // Capitalize first letter of locale
    this.currentLocale =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
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
