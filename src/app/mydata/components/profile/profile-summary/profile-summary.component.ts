//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  ChangeDetectorRef,
  Component,
  Input,
  OnInit,
  ViewEncapsulation,
} from '@angular/core';

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

  // TODO: Dynamic locale
  locale = 'Fi';

  dialogRef: MatDialogRef<EditorModalComponent>;

  constructor(
    private appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private patchService: PatchService,
    private publicationsService: PublicationsService,
    private snackbarService: SnackbarService,
    private draftService: DraftService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Get data sources
    this.dataSources = getDataSources(this.profileData);

    this.primarySource = this.dataSources[0];

    // this.sortAffiliations(this.profileData);

    if (!isEmptySection(this.profileData[4]))
      this.sortPublications(this.profileData);

    // this.filterSelectedItems();

    // this.cdr.detectChanges();
  }

  // filterSelectedItems() {
  //   const dataCopy = cloneDeep(this.profileData);

  //   for (let group of dataCopy) {
  //     group.fields.forEach((field) => {
  //       field.groupItems.map(
  //         (groupItem) =>
  //           (groupItem.items = groupItem.items.filter(
  //             (item) => item.itemMeta.show
  //           ))
  //       );

  //       field.groupItems = field.groupItems.filter(
  //         (groupItem) => groupItem.items.length
  //       );
  //     });

  //     group.fields = group.fields.filter((field) => field.groupItems.length);
  //   }

  //   // this.selectedData = dataCopy.filter((item) => item.fields.length);
  //   this.filteredProfileData = dataCopy;
  // }

  sortPublications(data) {
    // Combine groups and sort. Display items in summary only from first group
    const index = data.findIndex((item) => item.label === 'Julkaisut');

    const selectedItems = data[index].fields[0].selectedPublications;

    const items = data[index].fields[0].groupItems.flatMap(
      (groupItem) => groupItem.items
    );

    const merged = selectedItems?.length ? items.concat(selectedItems) : items;

    const sortedItems = merged.sort(
      (a, b) => b.publicationYear - a.publicationYear
    );

    data[index].fields[0].groupItems[0].items = sortedItems;

    this.profileData[index].fields[0].groupItems = [
      data[index].fields[0].groupItems[0],
    ];
  }

  // Sort primary affiliations first
  // sortAffiliations(data) {
  //   const index = data.findIndex((item) => item.label === 'Affiliaatiot');

  //   const groupItems = data[index].fields[0].groupItems;

  //   groupItems.map(
  //     (groupItem) =>
  //       (groupItem.items = groupItem.items.map((item) => ({
  //         ...item,
  //         source: groupItem.source,
  //       })))
  //   );

  //   const items = groupItems.flatMap((groupItem) => groupItem.items);

  //   const sortedItems = items.sort(
  //     (a, b) => b.itemMeta.primaryValue - a.itemMeta.primaryValue
  //   );

  //   data[index].fields[0].groupItems[0].items = sortedItems;

  //   this.profileData[index].fields[0].groupItems = [
  //     data[index].fields[0].groupItems[0],
  //   ];
  // }

  openDialog(event, index) {
    event.stopPropagation();

    if (!this.openPanels.includes(index)) this.openPanels.push(index);

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

              if (!isEmptySection(this.profileData[4]))
                this.sortPublications(this.profileData);

              // Do actions only if user has made changes
              if (
                result &&
                (confirmedPatchItems.length ||
                  confirmedPublicationPayload.length)
              ) {
                this.snackbarService.show('Luonnos päivitetty', 'success');
              }
            } else {
              // this.patchService.clearPatchItems();
            }
          }
        }
      );
  }
}
