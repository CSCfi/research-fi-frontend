import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { NotificationBannerComponent } from '../notification-banner/notification-banner.component';
import { NgStyle, NgIf, NgTemplateOutlet } from '@angular/common';

@Component({
    selector: 'app-banner-divider',
    templateUrl: './banner-divider.component.html',
    styleUrls: ['./banner-divider.component.scss'],
    standalone: true,
    imports: [
        NgStyle,
        NgIf,
        NgTemplateOutlet,
        NotificationBannerComponent,
    ],
})
export class BannerDividerComponent implements OnInit {
  @Input() template: TemplateRef<any>;

  defaultHeight = 3.125;

  constructor() {}

  ngOnInit(): void {}
}
