import { Component, Input, OnInit, TemplateRef } from '@angular/core';

@Component({
  selector: 'app-banner-divider',
  templateUrl: './banner-divider.component.html',
  styleUrls: ['./banner-divider.component.scss'],
})
export class BannerDividerComponent implements OnInit {
  @Input() heightInRem: string;
  @Input() template: TemplateRef<any>;

  defaultHeight = 3.125;

  constructor() {}

  ngOnInit(): void {}
}
