import { Component, OnInit } from '@angular/core';
import { BannerDividerComponent } from '../banner-divider/banner-divider.component';

@Component({
    selector: 'app-not-found',
    templateUrl: './not-found.component.html',
    styleUrls: ['./not-found.component.scss'],
    imports: [BannerDividerComponent]
})
export class NotFoundComponent implements OnInit {
  constructor() {}

  ngOnInit(): void {}
}
