import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NotificationBannerComponent } from '../notification-banner/notification-banner.component';
import { NgStyle, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-banner-divider',
    templateUrl: './banner-divider.component.html',
    styleUrls: ['./banner-divider.component.scss'],
    imports: [
    NgStyle,
    NgTemplateOutlet,
    NotificationBannerComponent
]
})
export class BannerDividerComponent implements OnInit {
  @Input() template: TemplateRef<any>;

  defaultHeight = 3.125;

  constructor() {}

  ngOnInit(): void {}
}
