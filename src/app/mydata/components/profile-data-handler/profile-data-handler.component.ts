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
import { checkSelected, getDataSources } from '../../utils';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from './editor-modal/editor-modal.component';

import { FieldTypes } from '@mydata/constants/fieldTypes';
import { take } from 'rxjs/operators';

import { PatchService } from '@mydata/services/patch.service';

// Remove in production
import { AppSettingsService } from '@shared/services/app-settings.service';

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

  profileData: any;

  fieldTypes = FieldTypes;

  dialogRef: MatDialogRef<EditorModalComponent>;

  constructor(
    private profileService: ProfileService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private appSettingsService: AppSettingsService,
    private patchService: PatchService
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

    // Set primary data source on init. Defaults to ORCID
    this.setPrimaryDataSource(this.dataSources[0]);
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

    radioGroups.forEach((group) =>
      group.groupItems.map((groupItem) => {
        if (groupItem.source.organization.nameFi === primarySource) {
          groupItem.items[0].itemMeta.show = true;
          this.patchService.addToPatchItems(groupItem.items[0].itemMeta);
        } else {
          groupItem.items[0].itemMeta.show = false;
        }
      })
    );
  }

  toggleSelectAll(selectAll: boolean) {
    const fields = this.profileData;
    const patchItems = [];

    for (const field of fields) {
      field.fields.forEach((group) => {
        if (!group.single) {
          group.groupItems.forEach((groupItem) =>
            groupItem.items.map((item) => {
              item.itemMeta.show = selectAll;
              if (selectAll) patchItems.push(item.itemMeta);
            })
          );
        }
      });
    }

    this.profileData = fields;

    selectAll
      ? this.patchService.addToPatchItems(patchItems)
      : this.patchService.clearPatchPayload();
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
      minWidth: '44vw',
      maxWidth: '44vw',
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
            console.log(
              'On editor modal close: ',
              this.patchService.currentPatchItems
            );
            this.profileData[index] = result.data;
            // this.patchData(result.patchGroups, result.patchItems);
          }

          this.patchService.clearPatchPayload();
        }
      );
  }

  patchData(patchGroups, patchItems) {
    this.profileService
      .patchObjects(patchGroups, patchItems)
      .pipe(take(1))
      .subscribe((response) => {
        console.log(response);
        this.snackBar.open('Muutokset tallennettu');
        // TODO: Alert when error
      });
  }
}
