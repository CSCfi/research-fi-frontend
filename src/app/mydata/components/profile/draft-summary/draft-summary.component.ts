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
import { checkGroupPatchItem } from '@mydata/utils';
import { combineLatest } from 'rxjs';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { FindByKeyValuePipe } from '../../../pipes/find-by-key-value.pipe';
import { countFieldItemsPipe } from '../../../pipes/count-field-items.pipe';
import { JoinItemsPipe } from '../../../../shared/pipes/join-items.pipe';
import { MatCheckbox } from '@angular/material/checkbox';
import { PrimaryBadgeComponent } from '../profile-panel/primary-badge/primary-badge.component';
import { PanelArrayItemComponent } from '../profile-panel/panel-array-item/panel-array-item.component';
import { NgFor, NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';

@Component({
    selector: 'app-draft-summary',
    templateUrl: './draft-summary.component.html',
    styleUrls: ['./draft-summary.component.scss'],
    standalone: true,
    imports: [
        MatAccordion,
        NgFor,
        NgIf,
        MatExpansionPanel,
        MatExpansionPanelHeader,
        MatExpansionPanelTitle,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        PanelArrayItemComponent,
        PrimaryBadgeComponent,
        MatCheckbox,
        JoinItemsPipe,
        countFieldItemsPipe,
        FindByKeyValuePipe,
    ],
})
export class DraftSummaryComponent implements OnInit, OnDestroy {
  fieldTypes = FieldTypes;

  @Input() profileData: any;
  @Input() collaborationOptions: any;

  collaborationHeader = $localize`:@@collaborationHeader:Yhteistyö`;
  selectedData: any;

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
    private appSettingsService: AppSettingsService,
    private collaborationsService: CollaborationsService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    this.collaborationOptions = this.collaborationsService.confirmedPayload;

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

  ngOnDestroy() {
    this.patchPayloadSub?.unsubscribe();
  }
}
