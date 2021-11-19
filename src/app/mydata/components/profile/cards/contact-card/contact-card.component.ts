//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from '@mydata/components/profile/editor-modal/editor-modal.component';
import { DraftService } from '@mydata/services/draft.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { PatchService } from '@mydata/services/patch.service';
import { cloneDeep } from 'lodash-es';
import { take } from 'rxjs/operators';
import { Constants } from '@mydata/constants/';
import { checkGroupSelected } from '@mydata/utils';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { ProfileService } from '@mydata/services/profile.service';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
})
export class ContactCardComponent implements OnInit {
  @Input() data: any;
  @Input() label: string;

  showDialog = false;

  dialogRef: MatDialogRef<EditorModalComponent>;

  fieldTypes = FieldTypes;
  checkGroupSelected = checkGroupSelected;
  contactFields: any;

  constructor(
    public dialog: MatDialog,
    private appSettingsService: AppSettingsService,
    private patchService: PatchService,
    private snackbarService: SnackbarService,
    private draftService: DraftService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {}

  openDialog() {
    this.dialogRef = this.dialog.open(EditorModalComponent, {
      data: {
        data: cloneDeep(this.data[0]),
      },
      panelClass: this.appSettingsService.dialogPanelClass,
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(
        (result: { data: any; patchGroups: any[]; patchItems: any[] }) => {
          const confirmedPatchItems = this.patchService.confirmedPatchItems;

          if (this.appSettingsService.isBrowser) {
            if (result) {
              // Set primary name to profile header
              if (
                confirmedPatchItems.find(
                  (item) => item.type === FieldTypes.personFirstNames
                )
              ) {
                const selectedNameId = confirmedPatchItems.find(
                  (item) => item.show
                ).id;
                const names = this.data[0].fields[0].groupItems.flatMap(
                  (groupItem) => groupItem.items
                );
                const selectedName = names.find(
                  (item) => item.itemMeta.id === selectedNameId
                ).value;

                this.profileService.setCurrentProfileName(selectedName);
              }

              // Update summary data with selection
              this.data[0] = result.data;

              this.draftService.saveDraft(this.data);

              // Do actions only if user has made changes
              if (confirmedPatchItems.length) {
                this.snackbarService.show(
                  $localize`:@@draftUpdated:Luonnos päivitetty`,
                  'success'
                );
              }
            }

            // Set draft profile data to storage
            sessionStorage.setItem(
              Constants.draftProfile,
              JSON.stringify(this.data)
            );

            // Set patch payload to store
            sessionStorage.setItem(
              Constants.draftPatchPayload,
              JSON.stringify(this.patchService.confirmedPatchItems)
            );
          }
        }
      );
  }
}
