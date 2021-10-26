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

  // TODO: Dynamic locale
  locale = 'Fi';

  patchItemIds: any[];
  patchPayloadSub: any;

  constructor(
    private patchService: PatchService,
    private publicationService: PublicationsService
  ) {}

  ngOnInit(): void {
    this.patchPayloadSub = combineLatest([
      this.patchService.currentPatchItems,
      this.publicationService.currentPublicationPayload,
    ]).subscribe((res) => {
      const patchItemIds = res[0].flatMap((item) => item.id);
      const publicationIds = res[1].flatMap(
        (publication) => publication.publicationId
      );

      const merged = patchItemIds.concat(publicationIds);

      this.patchItemIds = merged;
    });
  }

  ngOnDestroy() {
    this.patchPayloadSub?.unsubscribe();
  }
}
