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
import { checkSelected, checkEmpty } from './utils';
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
  selectedIndex = 0;
  openPanels: any = [];

  checkSelected = checkSelected;
  checkEmpty = checkEmpty;

  // TODO: Localize
  profileData = [
    { label: 'Yhteystiedot', fields: [] },
    { label: 'Tutkimustoiminnan kuvaus', fields: [] },
    { label: 'Affiliaatiot', fields: [] },
    { label: 'Koulutus', fields: [] },
    { label: 'Julkaisut', fields: [] },
    { label: 'Tutkimusaineistot', fields: [] },
    { label: 'Hankkeet', fields: [] },
    { label: 'Muut hankkeet', fields: [] },
    { label: 'Tutkimusinfrastruktuurit', fields: [] },
    { label: 'Muut tutkimusaktiviteetit', fields: [] },
    { label: 'Meriitit', fields: [] },
  ];

  selectedData: any;

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
    this.mapData();
  }

  mapData() {
    this.profileData[0].fields = this.response.personal;
    this.profileData[1].fields = this.response.description;
    this.profileData[2].fields = this.response.affiliation;
    this.profileData[3].fields = this.response.education;
    this.profileData[4].fields = this.response.publication;

    // TODO: Check locale
    this.dataSources = [
      ...new Map(
        this.getDataSources(this.profileData).map((item) => [
          item['nameFi'],
          item,
        ])
      ).values(),
    ].map((item) => item['nameFi']);

    // Set primary data source on init. Defaults to ORCID
    this.setPrimaryDataSource(this.dataSources[0]);
  }

  getDataSources(profileData) {
    return profileData
      .map((item) => item.fields)
      .filter((field) => field.length)
      .flat()
      .map((field) => field.groupItems)
      .flat()
      .map((field) => field.source.organization);
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
          groupItem.groupMeta.show = true;
          groupItem.items[0].itemMeta.show = true;
        } else {
          groupItem.groupMeta.show = false;
          groupItem.items[0].itemMeta.show = false;
        }
      })
    );
  }

  setOpenPanel(i: number) {
    if (!this.openPanels.find((val) => val === i)) this.openPanels.push(i);
  }

  closePanel(i: number) {
    this.openPanels = this.openPanels.filter((val) => val !== i);
  }

  openDialog(event, index) {
    event.stopPropagation();
    this.selectedIndex = index;
    this.selectedData = cloneDeep(this.profileData[index]);

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      minWidth: '44vw',
      maxWidth: '44vw',
      data: {
        data: cloneDeep(this.profileData[index]),
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
            this.profileData[this.selectedIndex] = result.data;
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
        this.snackBar.open('Muutokset tallennettu');
        // TODO: Alert when error
      });
  }
}
