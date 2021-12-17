import { Component, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-banner-divider',
  templateUrl: './banner-divider.component.html',
  styleUrls: ['./banner-divider.component.scss'],
})
export class BannerDividerComponent implements OnInit {
  @Input() heightInRem: string;

  defaultHeight = 3.125;

  constructor() {}

  ngOnInit(): void {}
}
