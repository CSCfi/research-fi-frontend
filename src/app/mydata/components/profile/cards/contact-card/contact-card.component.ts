//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { DraftService } from '@mydata/services/draft.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { PatchService } from '@mydata/services/patch.service';
import { cloneDeep } from 'lodash-es';
import { Constants } from '@mydata/constants/';
import { checkGroupSelected } from '@mydata/utils';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { ProfileService } from '@mydata/services/profile.service';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
})
export class ContactCardComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() label: string;

  fieldTypes = FieldTypes;
  checkGroupSelected = checkGroupSelected;
  contactFields: any;

  showDialog: boolean;
  dialogData: any;

  constructor(
    private appSettingsService: AppSettingsService,
    private patchService: PatchService,
    private snackbarService: SnackbarService,
    private draftService: DraftService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {}

  ngOnChanges(): void {
    //this.contactFields = this.filterNameField(this.data[0].fields);
  }

  openDialog(event: MouseEvent) {
    this.showDialog = true;
    this.dialogData = { data: cloneDeep(this.data[0]), trigger: event.detail };
  }

  handleChanges(result) {
    this.showDialog = false;

    const confirmedPayLoad = this.patchService.confirmedPayLoad;

    if (this.appSettingsService.isBrowser) {
      if (result) {
        // Set primary name to profile header
        if (
          confirmedPayLoad.find(
            (item) => item.type === FieldTypes.personFirstNames
          )
        ) {
          const selectedNameId = confirmedPayLoad.find(
            (item) =>
              item.show && item.type === this.fieldTypes.personFirstNames
          ).id;

          const names = this.data[0].fields[0].items;

          const selectedName = names.find(
            (item) => item.itemMeta.id === selectedNameId
          ).value;

          this.profileService.setEditorProfileName(selectedName);
        }

        // Update card & summary data with selection
        this.contactFields = this.filterNameField(result.fields);
        this.data[0] = result;

        this.draftService.saveDraft(this.data);

        // Do actions only if user has made changes
        if (confirmedPayLoad.length) {
          this.snackbarService.show(
            $localize`:@@draftUpdated:Luonnos päivitetty`,
            'success'
          );
        }

        if (confirmedPayLoad.length) {
          // Set draft profile data to storage
          sessionStorage.setItem(
            Constants.draftProfile,
            JSON.stringify(this.data)
          );
        }
      }

      // Set patch payload to store
      sessionStorage.setItem(
        Constants.draftPatchPayload,
        JSON.stringify(this.patchService.confirmedPayLoad)
      );
    }
  }

  filterNameField(fields) {
    // Filter out name field which is rendered in profile heading
    return fields.filter((field) => field.id !== 'name');
  }
}
