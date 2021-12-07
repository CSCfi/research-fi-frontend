//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT
import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { checkGroupSelected, checkGroupPatchItem } from '@mydata/utils';
import { combineLatest } from 'rxjs';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DatasetsService } from '@mydata/services/datasets.service';

@Component({
  selector: 'app-draft-summary',
  templateUrl: './draft-summary.component.html',
  styleUrls: ['./draft-summary.component.scss'],
})
export class DraftSummaryComponent implements OnInit, OnDestroy {
  fieldTypes = FieldTypes;

  @Input() profileData: any;

  selectedData: any;

  checkGroupSelected = checkGroupSelected;
  checkGroupPatchItem = checkGroupPatchItem;

  dataSources: any[];
  primarySource: string;

  openPanels = [];

  locale: string;

  combinedPatchItems: any[];
  patchPayloadSub: any;

  constructor(
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private appSettingsService: AppSettingsService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.patchPayloadSub = combineLatest([
      this.patchService.currentPatchItems,
      this.publicationsService.currentPublicationPayload,
      this.datasetsService.currentDatasetPayload,
    ]).subscribe((res) => {
      const patchItems = res[0];

      const patchPortalItems = res
        .slice(1)
        .flat()
        .flatMap((item) => item.itemMeta);

      const combinedItems = patchItems.concat(patchPortalItems);

      this.combinedPatchItems = combinedItems;
    });
  }

  ngOnDestroy() {
    this.patchPayloadSub?.unsubscribe();
  }
}
