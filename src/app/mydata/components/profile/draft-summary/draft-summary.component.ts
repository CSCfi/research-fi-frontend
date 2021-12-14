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
import { FundingsService } from '@mydata/services/fundings.service';

@Component({
  selector: 'app-draft-summary',
  templateUrl: './draft-summary.component.html',
  styleUrls: ['./draft-summary.component.scss'],
})
export class DraftSummaryComponent implements OnInit, OnDestroy {
  fieldTypes = FieldTypes;

  @Input() profileData: any;
  @Input() collaborationOptions: any;

  checkedCollaborationItemsCount = 0;
  collaborationHeader = $localize`:@@collaborationHeader:Yhteistyö`;
  selectedData: any;

  checkGroupSelected = checkGroupSelected;
  checkGroupPatchItem = checkGroupPatchItem;

  primarySource: string;

  openPanels = [];

  locale: string;

  combinedPatchItems: any[];
  patchPayloadSub: any;
  nameLocale = '';

  constructor(
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService,
    private appSettingsService: AppSettingsService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.countCheckedCollaborationOptions();
    this.nameLocale = 'name' + this.appSettingsService.capitalizedLocale;
    this.patchPayloadSub = combineLatest([
      this.patchService.currentPatchItems,
      this.publicationsService.currentPublicationPayload,
      this.datasetsService.currentDatasetPayload,
      this.fundingsService.currentFundingPayload,
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

  countCheckedCollaborationOptions() {
    this.collaborationOptions.forEach((val) => {
      if (Object.values(val).includes(true)) {
        this.checkedCollaborationItemsCount += 1;
      }
    });
  }

  ngOnDestroy() {
    this.patchPayloadSub?.unsubscribe();
  }
}
