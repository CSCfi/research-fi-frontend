//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  Component,
  Input,
  OnDestroy,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

import { cloneDeep, merge } from 'lodash-es';
import { take } from 'rxjs/operators';
import { PatchService } from '@mydata/services/patch.service';
import { PublicationsService } from '@mydata/services/publications.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { SnackbarService } from '@mydata/services/snackbar.service';
import { DraftService } from '@mydata/services/draft.service';
import { Constants } from '@mydata/constants/';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { GroupTypes, PortalGroups } from '@mydata/constants/groupTypes';
import { CommonStrings } from '@mydata/constants/strings';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileSummaryComponent implements OnInit, OnDestroy {
  @Input() profileData: any;

  fieldTypes = FieldTypes;
  groupTypes = GroupTypes;

  filteredProfileData: any;

  openPanels = [];

  locale: string;

  showDialog: boolean;
  dialogData: any;
  currentIndex: number;

  editString = CommonStrings.edit;
  selectString = CommonStrings.select;

  removeGroupItemsSub: Subscription;

  noPublicDataText = $localize`:@@youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;

  constructor(
    private appSettingsService: AppSettingsService,
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

  openDialog(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.showDialog = true;

    const selectedGroup = cloneDeep(this.profileData[index]);

    const filteredFields = selectedGroup.fields.filter(
      (field) => field.items.length
    );

    // Filter out fields with 0 items from groups that don't use search from portal functionality
    if (PortalGroups.indexOf(selectedGroup.id) === -1) {
      selectedGroup.fields = filteredFields;
    }

    this.dialogData = {
      data: selectedGroup,
      trigger: event.detail,
    };
    this.currentIndex = index;
  }

  closeDialog() {
    this.showDialog = false;
  }

  handleChanges(result) {
    this.closeDialog();

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
      this.profileData[this.currentIndex] = result;

      // // Merge imported publication for simpler display
      // const publications = this.profileData.find(
      //   (item) => item.id === 'publication'
      // );

      // if (publications?.fields?.length > 1) {
      //   const imported = publications.fields.find(
      //     (item) => item.id === 'imported'
      //   );
      //   const existing = publications.fields.find(
      //     (item) => item.id === 'publication'
      //   );

      //   const merged = existing.items.concat(imported.items);

      //   publications.fields = [{ ...existing, items: merged }];
      // }

      // Handle removal of items added from portal search
      portalPatchGroups.forEach((group) => {
        if (result.id === group.id) {
          if (group.deletables.length) {
            const removeItem = (publication: { id: string }) => {
              group.service.removeFromConfirmed(publication.id);
            };

            for (const [i, item] of group.deletables.entries()) {
              removeItem(item);
              if (i === group.deletables.length - 1)
                group.service.clearDeletables();
            }

            this.removeGroupItemsSub = group.service
              .removeItems(group.deletables)
              .pipe(take(1))
              .subscribe(() => {});
          }
        }
      });

      // Set draft data into storage with SSR check
      if (this.appSettingsService.isBrowser && confirmedPayLoad.length) {
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
  }

  ngOnDestroy(): void {
    this.removeGroupItemsSub?.unsubscribe();
  }
}
