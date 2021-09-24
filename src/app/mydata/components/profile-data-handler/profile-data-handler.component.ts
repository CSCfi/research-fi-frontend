//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { faCheckCircle } from '@fortawesome/free-solid-svg-icons';
import { cloneDeep } from 'lodash-es';
import { ProfileService } from '@mydata/services/profile.service';
import {
  checkSelected,
  getDataSources,
  mergePublications,
  isEmptySection,
} from '@mydata/utils';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from './editor-modal/editor-modal.component';

import { FieldTypes } from '@mydata/constants/fieldTypes';
import { take } from 'rxjs/operators';

import { PatchService } from '@mydata/services/patch.service';
import { Constants } from '@mydata/constants/';

// Remove in production
import { AppSettingsService } from '@shared/services/app-settings.service';
import { DraftService } from '@mydata/services/draft.service';

@Component({
  selector: 'app-profile-data-handler',
  templateUrl: './profile-data-handler.component.html',
  styleUrls: ['./profile-data-handler.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileDataHandlerComponent implements OnInit {
  testData: any;

  @Input() response: any;

  faCheckCircle = faCheckCircle;

  dataSources: any[];
  primarySource: string;
  openPanels: any = [];

  checkSelected = checkSelected;
  getDataSources = getDataSources;
  mergePublications = mergePublications;
  isEmptySection = isEmptySection;

  profileData: any;

  fieldTypes = FieldTypes;

  dialogRef: MatDialogRef<EditorModalComponent>;

  constructor(
    private profileService: ProfileService,
    private snackbarService: SnackbarService,
    public dialog: MatDialog,
    private appSettingsService: AppSettingsService,
    private patchService: PatchService,
    private draftService: DraftService
  ) {
    this.testData = profileService.testData;
  }

  ngOnInit(): void {
    this.response = this.appSettingsService.myDataSettings.develop
      ? this.testData
      : this.response;

    this.profileData = this.response.profileData;

    // Get data sources
    this.dataSources = getDataSources(this.profileData);

    const initialPrimarySource = this.dataSources[0];

    // Set primary data source on init. Defaults to ORCID
    this.setPrimaryDataSource(initialPrimarySource);

    // Merge publications
    // TODO: Find better way to pass array element than index number. Eg. type
    const publications = this.profileData[4];
    if (!isEmptySection(publications)) this.mergePublications(publications);
  }

  setPrimaryDataSource(option) {
    this.primarySource = option;

    // Set default options for radio button groups
    this.setDefaultOptions(
      this.profileData.filter((element) => element.fields.length),
      option
    );
  }

  setDefaultOptions(data, primarySource) {
    const radioGroups = data
      .flatMap((el) => el.fields.find((field) => field.single))
      .filter((item) => item);

    const patchItems = [];

    radioGroups.forEach((group) =>
      group.groupItems.map((groupItem) => {
        if (groupItem.source.organization.nameFi === primarySource) {
          groupItem.items[0].itemMeta.show = true;
          patchItems.push(groupItem.items[0].itemMeta);
        } else {
          groupItem.items[0].itemMeta.show = false;
        }
      })
    );

    // Patch default options, hide snackbar notification
    this.patchItems(patchItems, true);
  }

  toggleSelectAll(selectAll: boolean) {
    const fields = this.profileData;
    const patchItems = [];

    for (const field of fields) {
      field.fields.forEach((group) => {
        if (!group.single) {
          group.groupItems.forEach((groupItem) =>
            groupItem.items.map((item) => {
              if (selectAll) {
                if (!item.itemMeta.show) {
                  item.itemMeta.show = true;
                  patchItems.push(item.itemMeta);
                }
              } else {
                if (item.itemMeta.show) {
                  item.itemMeta.show = false;
                  patchItems.push(item.itemMeta);
                }
              }
            })
          );
        }
        if (group.selectedPublications) {
          group.selectedPublications.forEach((publication) => {
            publication.itemMeta.show = selectAll;
            patchItems.push(publication.itemMeta);
          });
        }
      });
    }

    this.profileData = fields;

    this.patchItems(patchItems);
  }

  setOpenPanel(i: number) {
    if (!this.openPanels.find((val) => val === i)) this.openPanels.push(i);
  }

  closePanel(i: number) {
    this.openPanels = this.openPanels.filter((val) => val !== i);
  }

  openDialog(event, index) {
    event.stopPropagation();

    const selectedField = cloneDeep(this.profileData[index]);

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      ...this.appSettingsService.dialogSettings,
      data: {
        data: selectedField,
        dataSources: this.dataSources,
        primarySource: this.primarySource,
      },
    });

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(
        (result: { data: any; patchGroups: any[]; patchItems: any[] }) => {
          if (result) {
            const currentPatchItems = this.patchService.currentPatchItems;

            this.profileData[index] = result.data;

            this.draftService.saveDraft(this.profileData);

            if (this.appSettingsService.isBrowser) {
              sessionStorage.setItem(
                Constants.draftProfile,
                JSON.stringify(this.profileData)
              );
            }

            // if (currentPatchItems.length) this.patchItems(currentPatchItems);
          }

          this.patchService.clearPatchItems();
        }
      );
  }

  patchItems(patchItems, hideNotification = false) {
    this.profileService
      .patchObjects(patchItems)
      .pipe(take(1))
      .subscribe(
        (result) => {
          if (!hideNotification)
            this.snackbarService.show('Muutokset tallennettu', 'success');
        },
        (error) => {
          this.snackbarService.show('Virhe tiedon tallennuksessa', 'error');
        }
      );
  }
}
