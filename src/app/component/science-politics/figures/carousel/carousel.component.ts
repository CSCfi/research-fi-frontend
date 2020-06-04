import { Component, OnInit, Input, OnChanges, Inject, LOCALE_ID } from '@angular/core';

@Component({
  selector: 'app-carousel',
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.scss']
})
export class CarouselComponent implements OnInit, OnChanges {

  @Input() data: any[];
  @Input() id: string;

  slicedData;
  idx: number;
  maxIdx: number;
  currentLocale: string;

  constructor(@Inject( LOCALE_ID ) protected localeId: string) {
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  ngOnInit(): void {
  }

  ngOnChanges() {
    this.maxIdx = this.data.length - 1;
    this.idx = this.data.findIndex(x => x.link === this.id);
    this.slicedData = this.sliceAround(this.idx, this.maxIdx, this.data);
    console.log(this.slicedData);
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
