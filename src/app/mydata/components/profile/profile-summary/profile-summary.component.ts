//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { cloneDeep } from 'lodash-es';
import { checkGroupSelected } from '@mydata/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from '@mydata/components/profile/editor-modal/editor-modal.component';
import { take } from 'rxjs/operators';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { DraftService } from '@mydata/services/draft.service';
import { Constants } from '@mydata/constants/';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { CommonStrings } from '@mydata/constants/strings';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileSummaryComponent implements OnInit {
  @Input() profileData: any;

  fieldTypes = FieldTypes;
  groupTypes = GroupTypes;

  filteredProfileData: any;

  checkGroupSelected = checkGroupSelected;

  openPanels = [];

  locale: string;

  dialogRef: MatDialogRef<EditorModalComponent>;

  editString = CommonStrings.edit;
  selectString = CommonStrings.select;

  constructor(
    private appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private fundingsService: FundingsService,
    private snackbarService: SnackbarService,
    private draftService: DraftService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {}

  openDialog(event, index) {
    event.stopPropagation();

    if (!this.openPanels.includes(index)) this.openPanels.push(index);

    const selectedField = cloneDeep(this.profileData[index]);

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      data: {
        data: selectedField,
      },
      panelClass: this.appSettingsService.dialogPanelClass,
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: { data: any }) => {
        const confirmedPayLoad = this.patchService.confirmedPayLoad;

        this.draftService.saveDraft(this.profileData);

        // Groups are used in different loops to set storage items and handle removal of items
        const patchGroups = [
          { key: Constants.draftProfile, data: this.profileData },
          {
            key: Constants.draftPatchPayload,
            data: this.patchService.confirmedPayLoad,
          },
          {
            id: GroupTypes.publication,
            key: Constants.draftPublicationPatchPayload,
            service: this.publicationsService,
            data: this.publicationsService.confirmedPayload,
            deletables: this.publicationsService.deletables,
          },
          {
            id: GroupTypes.dataset,
            key: Constants.draftDatasetPatchPayload,
            service: this.datasetsService,
            data: this.datasetsService.confirmedPayload,
            deletables: this.datasetsService.deletables,
          },
          {
            id: GroupTypes.funding,
            key: Constants.draftFundingPatchPayload,
            service: this.fundingsService,
            data: this.fundingsService.confirmedPayload,
            deletables: this.fundingsService.deletables,
          },
        ];

        const portalPatchGroups = patchGroups.filter((group) => group.id);

        if (result) {
          // Update binded profile data. Renders changes into summary view
          this.profileData[index] = result.data;

          // Handle removal of items added from portal search
          portalPatchGroups.forEach((group) => {
            if (result.data.id === group.id) {
              if (group.deletables.length) {
                const removeItem = (publication: { id: string }) => {
                  group.service.removeFromConfirmed(publication.id);
                };

                for (const [i, item] of group.deletables.entries()) {
                  removeItem(item);
                  if (i === group.deletables.length - 1)
                    group.service.clearDeletables();
                }

                group.service
                  .removeItems(group.deletables)
                  .pipe(take(1))
                  .subscribe(() => {});
              }
            }
          });

          // Set draft data into storage with SSR check
          if (this.appSettingsService.isBrowser) {
            patchGroups.forEach((group) => {
              sessionStorage.setItem(group.key, JSON.stringify(group.data));
            });

            // Display snackbar only if user has made changes
            if (result && confirmedPayLoad.length) {
              this.snackbarService.show(
                $localize`:@@draftUpdated:Luonnos päivitetty`,
                'success'
              );
            }
          }
        }
      });
  }
}
