//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { PatchService } from '@mydata/services/patch.service';
import { cloneDeep } from 'lodash-es';
import { Constants } from '@mydata/constants/';
import { checkGroupSelected } from '@mydata/utils';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { ProfileService } from '@mydata/services/profile.service';
import { ActivatedRoute } from '@angular/router';
import { HasSelectedItemsPipe } from '../../../../pipes/has-selected-items.pipe';
import { JoinAllGroupItemsPipe } from '../../../../pipes/join-all-group-items.pipe';
import { FilterPipe } from '../../../../pipes/filter.pipe';
import { EditorModalComponent } from '../../editor-modal/editor-modal.component';
import { PanelArrayItemComponent } from '../../profile-panel/panel-array-item/panel-array-item.component';
import { EmptyCardComponent } from '../empty-card/empty-card.component';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe } from '@angular/common';
import { ProfileEditorCardHeaderComponent } from '../profile-editor-card-header/profile-editor-card-header.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import {
  ContactInfoViewComponent
} from '@mydata/components/shared-layouts/contact-info-view/contact-info-view.component';

@Component({
  selector: 'app-contact-card',
  templateUrl: './contact-card.component.html',
  standalone: true,
  imports: [
    ProfileEditorCardHeaderComponent,
    NgIf,
    EmptyCardComponent,
    NgFor,
    NgSwitch,
    NgSwitchCase,
    EditorModalComponent,
    FilterPipe,
    JoinAllGroupItemsPipe,
    HasSelectedItemsPipe,
    SvgSpritesComponent,
    ContactInfoViewComponent
  ]
})
export class ContactCardComponent implements OnInit, OnChanges {
  @Input() data: any;
  @Input() label: string;
  @Input() showEditButton: boolean;

  fieldTypes = FieldTypes;
  checkGroupSelected = checkGroupSelected;
  contactFields: any;

  showDialog: boolean;
  dialogData: any;
  myDataProfile: any;
  publishedFullname: string;
  publishedFullnameLabel: string;

  constructor(
    private appSettingsService: AppSettingsService,
    private patchService: PatchService,
    private snackbarService: SnackbarService,
    public profileService: ProfileService,
    private route: ActivatedRoute,
  ) {}


  ngOnInit(): void {
    this.myDataProfile = this.route.snapshot.data.myDataProfile;
  }

  ngOnChanges(): void {
    this.contactFields = this.data[0].fields;
    this.myDataProfile = this.route.snapshot.data.myDataProfile;
    this.publishedFullname = null;
    //this.setVisibleNameById(null);
  }

  openDialog(event: any) {
    this.showDialog = true;
    this.dialogData = { data: cloneDeep(this.data[0]), trigger: event.detail };
  }

  setVisibleNameById(metaId: number) {
    // Without id, sets current name from profile
    if (this.myDataProfile) {
      this.publishedFullname = this.myDataProfile.profileData.filter(
        item => item.id === 'contact')[0].fields.filter(
        item => {
          if (item.id === 'name') {
            this.publishedFullnameLabel = item.label;
            return true;
          }
        }
      )[0].items.filter(
        item => {
          if (metaId) {
            return item.itemMeta.id === metaId;
          } else {
            return item.itemMeta.show === true;
          }
        })[0].fullName;
      if (metaId) {
        this.profileService.setEditorProfileName(this.publishedFullname);
      }
    }
  }

  handleChanges(result) {
    this.showDialog = false;

    const confirmedPayLoad = this.patchService.confirmedPayLoad;
    if (this.appSettingsService.isBrowser) {
      if (result) {
        // Set primary name to profile header
        if (
          confirmedPayLoad.find(
            (item) => item.type === FieldTypes.personName
          )
        ) {
          const selectedNameId = confirmedPayLoad.find(
            (item) =>
              item.show && item.type === this.fieldTypes.personName
          ).id;
          this.setVisibleNameById(selectedNameId);
        }

        // Update card & summary data with selection
        this.contactFields = result.fields;
        this.data[0] = result;

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
