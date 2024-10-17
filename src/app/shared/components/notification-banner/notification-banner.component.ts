//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, OnInit } from '@angular/core';
import { NotificationService } from '@shared/services/notification.service';
import { NotificationObject } from '@shared/types';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { MatButton } from '@angular/material/button';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf, NgFor } from '@angular/common';
import { CollapseModule } from 'ngx-bootstrap/collapse';

@Component({
    selector: 'app-notification-banner',
    templateUrl: './notification-banner.component.html',
    styleUrls: ['./notification-banner.component.scss'],
    standalone: true,
    imports: [
        CollapseModule,
        NgIf,
        FontAwesomeModule,
        NgFor,
        MatButton,
    ],
})
export class NotificationBannerComponent implements OnInit {
  isCollapsed = true;
  faExclamationCircle = faExclamationCircle;
  notificationObject: NotificationObject;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.notificationObject.subscribe(
      (response: NotificationObject) => {
        this.notificationObject = response;

        // Timeout enables animation when rendering notification
        if (response?.notificationText) {
          setTimeout(() => {
            this.isCollapsed = false;
          }, 0);
        } else {
          this.isCollapsed = true;
        }
      }
    );
  }
}
