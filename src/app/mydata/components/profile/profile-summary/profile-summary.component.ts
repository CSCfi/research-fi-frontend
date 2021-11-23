//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';

import { cloneDeep } from 'lodash-es';
import {
  checkGroupSelected,
  getDataSources,
  isEmptySection,
} from '@mydata/utils';
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
  getDataSources = getDataSources;

  dataSources: any[];
  primarySource: string;

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
    private snackbarService: SnackbarService,
    private draftService: DraftService
  ) {
    this.locale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    // Get data sources
    this.dataSources = getDataSources(this.profileData);

    this.primarySource = this.dataSources[0];
  }

  openDialog(event, index) {
    event.stopPropagation();

    if (!this.openPanels.includes(index)) this.openPanels.push(index);

    const selectedField = cloneDeep(this.profileData[index]);

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      data: {
        data: selectedField,
        dataSources: this.dataSources,
        primarySource: this.primarySource,
      },
      panelClass: this.appSettingsService.dialogPanelClass,
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(
        (result: { data: any; patchGroups: any[]; patchItems: any[] }) => {
          const confirmedPatchItems = this.patchService.confirmedPatchItems;
          const confirmedPublicationPayload =
            this.publicationsService.confirmedPayload;
          const publicationsToDelete = this.publicationsService.deletables;

          this.draftService.saveDraft(this.profileData);

          // Handle removal of publications
          const deletePublication = (publication: {
            publicationId: string;
          }) => {
            this.publicationsService.removeFromConfirmed(
              publication.publicationId
            );
          };

          if (publicationsToDelete.length > 0) {
            for (const [i, publication] of publicationsToDelete.entries()) {
              deletePublication(publication);
              if (i === publicationsToDelete.length - 1)
                this.publicationsService.clearDeletables();
            }

            this.publicationsService
              .removePublications(publicationsToDelete)
              .pipe(take(1))
              .subscribe((response: any) => {});
          }

          // Set current data
          if (result) {
            this.profileData[index] = result.data;
            // this.profileService.setCurrentProfileData(this.profileData); // ei toimi tässä

            if (this.appSettingsService.isBrowser) {
              // Set draft profile data to storage
              sessionStorage.setItem(
                Constants.draftProfile,
                JSON.stringify(this.profileData)
              );

              // Set patch payload to store
              sessionStorage.setItem(
                Constants.draftPatchPayload,
                JSON.stringify(this.patchService.confirmedPatchItems)
              );

              // Update publication payload to store
              sessionStorage.setItem(
                Constants.draftPublicationPatchPayload,
                JSON.stringify(this.publicationsService.confirmedPayload)
              );

              // Sort
              // this.sortAffiliations(this.profileData);

              // if (!isEmptySection(this.profileData[4]))
              //   this.sortPublications(this.profileData);

              // Do actions only if user has made changes
              if (
                result &&
                (confirmedPatchItems.length ||
                  confirmedPublicationPayload.length)
              ) {
                this.snackbarService.show(
                  $localize`:@@draftUpdated:Luonnos päivitetty`,
                  'success'
                );
              }
            } else {
              // this.patchService.clearPatchItems();
            }
          }
        }
      );
  }
}
