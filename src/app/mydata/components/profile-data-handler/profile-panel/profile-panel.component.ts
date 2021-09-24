//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  Input,
  OnChanges,
  OnInit,
} from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { checkGroupSelected, isEmptySection } from '@mydata/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchPublicationsComponent } from './search-publications/search-publications.component';
import { take } from 'rxjs/operators';
import { PublicationsService } from '@mydata/services/publications.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { PatchService } from '@mydata/services/patch.service';
import { ProfileService } from '@mydata/services/profile.service';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
})
export class ProfilePanelComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() dataSources: any;
  @Input() primarySource: string;
  @Input() data: any;

  allSelected: boolean;

  mobileStatusSub: Subscription;

  fieldTypes = FieldTypes;

  checkGroupSelected = checkGroupSelected;
  isEmptySection = isEmptySection;

  openPanels = [];

  // TODO: Dynamic locale
  locale = 'Fi';

  dialogRef: MatDialogRef<SearchPublicationsComponent>;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  disableAnimation = true;
  hasFetchedPublications: boolean;

  ttvLabel = 'Tiedejatutkimus.fi';
  updated: Date;
  selectedPublications: any[];

  constructor(
    private appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private publicationService: PublicationsService,
    private profileService: ProfileService,
    private patchService: PatchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // TODO: Better check for data. Maybe type when mapping response
    if (this.data.id === 'publication' && this.data.fields.length) {
      this.findFetchedPublications(this.data.fields[0].groupItems);

      // Sort publications that are fetched in  profile creation
      if (!isEmptySection(this.data)) this.sortPublications(this.data.fields);
    }
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  // Fix for Mat Expansion Panel render FOUC
  ngAfterViewInit(): void {
    setTimeout(() => (this.disableAnimation = false));
  }

  setDefaultPrimaryValue(data) {
    // Set default only if primary value is not set
    data.map((group) => {
      if (group.hasPrimaryValue) {
        const groupItems = group.groupItems.map((groupItem) => groupItem.items);
        const itemArr = [].concat.apply([], groupItems);

        if (!itemArr.some((item) => item.itemMeta.primaryValue === true))
          group.groupItems[0].items[0].itemMeta.primaryValue = true;
      }
    });
  }

  toggleGroup(index: number) {
    this.openPanels.includes(index)
      ? (this.openPanels = this.openPanels.filter((item) => item !== index))
      : this.openPanels.push(index);
  }

  closePanel(index) {
    this.openPanels = this.openPanels.filter((item) => item !== index);
  }

  toggleRadioItem(event, index) {
    let selectedItem: { itemMeta: any };
    const patchObjects = [];

    const original = this.profileService.currentProfileData.find(
      (group) => group.id === this.data.id
    ).fields[index];

    const group = this.data.fields[index];

    group.groupItems.map((groupItem) => {
      const currentSelection = groupItem.items.find(
        (item) => item.itemMeta.id === event.value
      );

      if (currentSelection) {
        selectedItem = currentSelection;
        patchObjects.push({ ...currentSelection.itemMeta, show: true });
      }

      groupItem.items.map(
        (item) =>
          (item.itemMeta.show = item.itemMeta.id === event.value ? true : false)
      );
    });

    const previousSelection = original.groupItems
      .map((groupItem) => groupItem.items)
      .flat()
      .find((item) => item.itemMeta.show);

    if (previousSelection.itemMeta.id !== selectedItem.itemMeta.id)
      patchObjects.push({ ...previousSelection.itemMeta, show: false });

    // Remove patch items with type same as radio button item type
    this.patchService.removeItemsWithType(selectedItem.itemMeta.type);

    // Add to patch items
    this.patchService.addToPatchItems(patchObjects);
  }

  toggleItem(event, groupItem, item, index) {
    const publicationType = this.fieldTypes.activityPublication;

    if (
      item.itemMeta.primaryValue &&
      !event.checked &&
      groupItem.groupMeta.type !== publicationType
    ) {
      item.itemMeta.primaryValue = false;
      this.setDefaultPrimaryValue(this.data.fields);
    }

    const parentGroup = this.data.fields[index].groupItems.find(
      (group: { groupMeta: { id: any } }) =>
        group.groupMeta.id === groupItem.groupMeta.id
    );

    const currentItem = parentGroup.items.find(
      (i: { itemMeta: { id: any } }) => i.itemMeta.id === item.itemMeta.id
    );

    currentItem.itemMeta.show = event.checked;

    this.patchService.addToPatchItems({
      ...item.itemMeta,
      show: event.checked,
    });
  }

  toggleJoined(event, groupItem) {
    groupItem.items.map((item) => (item.itemMeta.show = event.checked));

    const patchItems = groupItem.items.map((item) => item.itemMeta);

    this.patchService.addToPatchItems(patchItems);
  }

  // Publication toggle method is meant to be used with publications fetched in current session.
  togglePublication(event, publication) {
    publication.itemMeta.show = event.checked;

    this.patchService.addToPatchItems(publication.itemMeta);
  }

  removePublication(publication: {
    publicationId: string;
    itemMeta: { id: string | null };
  }) {
    const field = this.data.fields[0];
    let selectedPublications = field.selectedPublications;

    // Method to remove publications added in current session
    const handleRemoveFromSession = () => {
      const groupItems = field.groupItems;

      for (const group of groupItems) {
        group.items = group.items.filter(
          (item) => item.publicationId !== publication.publicationId
        );
      }
      field.groupItems = groupItems;
    };

    // Only publications from profile have item meta ID
    if (publication.itemMeta.id) {
      // this.publicationService.addToDeletables(publication);} // If we decide to let user reverse deletion

      this.publicationService
        .deletePublication(publication.publicationId)
        .pipe(take(1))
        .subscribe((res: any) => {
          if (res.ok && res.body.success) {
            // Publications are stored in either selectedPublications, which consists of publications fetched in current session
            // and groupItems, which consists of added publications.
            if (
              selectedPublications?.findIndex(
                (item) => item.publicationId === publication.publicationId
              ) > -1
            ) {
              selectedPublications = selectedPublications.filter(
                (item) => item.publicationId !== publication.publicationId
              );

              field.selectedPublications = selectedPublications;
            } else {
              handleRemoveFromSession();
            }

            // Set fetched publications flag
            this.hasFetchedPublications =
              field.groupItems[0].items.filter(
                (item) => item.itemMeta.primaryValue
              ).length > 0;
          }
        });
    } else {
      handleRemoveFromSession();
    }
  }

  findFetchedPublications(data) {
    const items = data.flatMap((group) => group.items);

    if (items.find((item) => item.itemMeta.primaryValue))
      this.hasFetchedPublications = true;
  }

  sortPublications(data) {
    const index = data.findIndex((item) => item.label === 'Julkaisut');

    const items = data[index].groupItems.flatMap(
      (groupItem) => groupItem.items
    );

    // Combine groups and sort. Display items in summary only from first group
    const sortedItems = items.sort(
      (a, b) => b.publicationYear - a.publicationYear
    );

    data[index].groupItems[0].items = sortedItems;

    this.data.fields[index].groupItems = [data[index].groupItems[0]];
  }

  // Search publications
  openSearchPublicationsDialog() {
    const fields = this.data.fields[0];

    this.dialogRef = this.dialog.open(SearchPublicationsComponent, {
      ...this.appSettingsService.dialogSettings,
      data: {
        profilePublications: fields.groupItems,
        selectedPublications: fields.selectedPublications,
      },
    });

    // this.dialogRef
    //   .afterClosed()
    //   .pipe(take(1))
    //   .subscribe((result: { selectedPublications: any[] }) => {
    //     console.log('publications: ', result.selectedPublications);
    //     this.publicationService.addToPayload(result.selectedPublications);

    //     this.selectedPublications = result.selectedPublications;

    //     // const selectedPublications = result.selectedPublications;

    //     // if (selectedPublications) {
    //     //   this.publicationService
    //     //     .addPublications(selectedPublications)
    //     //     .pipe(take(1))
    //     //     .subscribe((result: { ok: boolean }) => {
    //     //       console.log(result);
    //     //       if (result.ok) {
    //     //       }
    //     //     });
    //     // }
    //   });

    // Set selected publications to field items
    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(
        (result: {
          selectedPublications: any[];
          publicationsNotFound: any[];
          publicationsAlreadyInProfile: any[];
          source: any;
        }) => {
          // Reset sort when dialog closes
          this.publicationService.resetSort();

          if (result) {
            console.log('publications: ', result.selectedPublications);
            // Tää vasta kun painetaan TALLENNA
            this.publicationService.addToPayload(result.selectedPublications);

            // // Handle publications
            // const patchPublications = result.selectedPublications.map(
            //   (item) => item.itemMeta
            // );

            const preSelection = this.data.fields[0].groupItems.flatMap(
              (group) => group.items
            );

            const mergedPublications = preSelection
              .concat(result.selectedPublications)
              .sort((a, b) => b.publicationYear - a.publicationYear);

            console.log('merged: ', mergedPublications);

            this.hasFetchedPublications = true;

            // Else case is for when publications don't exist in user profile
            if (!isEmptySection(this.data)) {
              this.data.fields[0].groupItems[0].items = mergedPublications;
            } else {
              this.data.fields[0].groupItems.push({
                items: mergedPublications,
                groupMeta: { type: this.fieldTypes.activityPublication },
                source: result.source,
              });
            }

            this.updated = new Date();

            // this.patchService.addToPatchItems(patchPublications);

            this.cdr.detectChanges();
          }
        }
      );
  }
}
