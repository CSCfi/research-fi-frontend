//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, TemplateRef } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-mydata-beta-info',
  templateUrl: './mydata-beta-info.component.html',
  styleUrls: ['./mydata-beta-info.component.scss'],
})
export class MydataBetaInfoComponent implements OnInit {
  @Input() template: TemplateRef<any>;
  @Input() showCloseButton: boolean;

  open = true;
  appSettings: any;
  textContent: string;

  constructor(
    public appSettingsService: AppSettingsService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    this.appSettings = this.appSettingsService.myDataSettings;

    // Get localized text content from CMS
    this.textContent = this.route.snapshot.data.pages.find(
      (item) => item.id === 'mydata_beta_text'
    )['content' + this.appSettingsService.capitalizedLocale];
  }

  toggle() {
    this.open = !this.open;
  }
}
