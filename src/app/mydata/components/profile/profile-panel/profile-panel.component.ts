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
import { SearchPortalComponent } from './search-portal/search-portal.component';
import { take } from 'rxjs/operators';
import { PublicationsService } from '@mydata/services/publications.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { PatchService } from '@mydata/services/patch.service';
import { ProfileService } from '@mydata/services/profile.service';
import { cloneDeep } from 'lodash-es';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { CommonStrings } from '@mydata/constants/strings';
import { SearchPortalService } from '@mydata/services/search-portal.service';
import { DatasetsService } from '@mydata/services/datasets.service';

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
  groupTypes = GroupTypes;

  checkGroupSelected = checkGroupSelected;
  isEmptySection = isEmptySection;

  openPanels = [];

  // TODO: Dynamic locale
  locale = 'Fi';

  dialogRef: MatDialogRef<SearchPortalComponent>;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  disableAnimation = true;
  hasFetchedPublications: boolean;

  updated: Date; // Generate new Date to detect changes in pipes
  selectedPublications: any[];
  combinedItems: any[];

  ttvLabel = CommonStrings.ttvLabel;
  primary = CommonStrings.primary;
  setAsPrimary = CommonStrings.setAsPrimary;

  constructor(
    public appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private publicationsService: PublicationsService,
    private datasetsService: DatasetsService,
    private searchPortalService: SearchPortalService,
    private profileService: ProfileService,
    private patchService: PatchService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    // Combine items from groups
    const groupItems = cloneDeep(this.data.fields[0].groupItems);

    groupItems.map(
      (groupItem) =>
        (groupItem.items = groupItem.items.map((item) => ({
          ...item,
          groupType: groupItem.groupMeta.type,
          source: groupItem.source,
        })))
    );

    const items = [...groupItems].flatMap((groupItem) => groupItem.items);

    this.combinedItems = items;

    // // TODO: Better check for data. Maybe type when mapping response
    // if (this.data.id === 'publication' && this.data.fields.length) {
    //   this.findFetchedPublications(this.data.fields[0].groupItems);
    //   // Sort publications that are fetched in  profile creation
    //   if (!isEmptySection(this.data)) this.sortPublications(this.data.fields);
    // }
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

    const original = cloneDeep(
      this.profileService.currentProfileData.find(
        (group) => group.id === this.data.id
      ).fields[index]
    );

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
    const datasetType = this.fieldTypes.activityDataset;

    const groupMeta = groupItem.groupMeta;

    if (
      item.itemMeta.primaryValue &&
      !event.checked &&
      groupMeta.type !== publicationType &&
      groupMeta.type !== datasetType
    ) {
      item.itemMeta.primaryValue = false;
      this.setDefaultPrimaryValue(this.data.fields);
    }

    const parentGroup = this.data.fields[index].groupItems.find(
      (group: { groupMeta: { id: any } }) => group.groupMeta.id === groupMeta.id
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

  removeItem(
    groupType: number,
    itemToRemove: { id: string; itemMeta: { id: string | null } }
  ) {
    const field = this.data.fields[0];
    const groupItems = field.groupItems;

    for (const group of groupItems) {
      group.items = group.items.filter(
        (item) => item.itemMeta.id !== itemToRemove.itemMeta.id
      );
    }

    field.groupItems = groupItems;

    switch (groupType) {
      case this.fieldTypes.activityDataset: {
        this.datasetsService.addToDeletables(itemToRemove);
        break;
      }
      case this.fieldTypes.activityPublication: {
        this.publicationsService.addToDeletables(itemToRemove);
        break;
      }
    }

    // Refresh pipes
    this.updated = new Date();
  }

  findFetchedPublications(data) {
    const items = data.flatMap((group) => group.items);

    if (items.find((item) => item.itemMeta.primaryValue))
      this.hasFetchedPublications = true;
  }

  sortPublications(data) {
    const index = data.findIndex((item) => item.id === 'publication');

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
  openSearchFromResearchFiDialog(groupId: string) {
    const fields = this.data.fields[0];

    this.dialogRef = this.dialog.open(SearchPortalComponent, {
      data: {
        groupId: groupId,
        itemsInProfile: fields?.groupItems,
        selectedPublications: fields?.selectedPublications,
      },
      panelClass: this.appSettingsService.dialogPanelClass,
    });

    type PublicationsResult = { selection: any[] };
    type DatasetsResult = { selection: any[] };

    const handlePublications = (result: PublicationsResult) => {
      this.publicationsService.addToPayload(result.selection);

      const groupItems = this.data.fields[0].groupItems;

      const fetchedPublications = groupItems.find(
        (groupItem) =>
          groupItem.groupMeta.type === this.fieldTypes.activityPublication
      );

      if (fetchedPublications) {
        this.data.fields[0].groupItems.find(
          (groupItem) =>
            groupItem.groupMeta.type === this.fieldTypes.activityPublication
        ).items = fetchedPublications.items.concat(result.selection);
      } else {
        this.data.fields[0].groupItems.push({
          groupMeta: { type: this.fieldTypes.activityPublication },
          source: {
            organization: {
              nameFi: 'Tiedejatutkimus.fi',
              nameSv: 'Forskning.fi',
              nameEn: 'Research.fi',
            },
          },
          items: result.selection,
        });
      }
    };

    const handleDatasets = (result: DatasetsResult) => {
      this.datasetsService.addToPayload(result.selection);

      let existingAddedDatasets = this.data.fields[0].groupItems.find(
        (group) => group.groupMeta.type === this.fieldTypes.activityDataset
      );

      if (existingAddedDatasets) {
        existingAddedDatasets.items = existingAddedDatasets.items.concat(
          result.selection
        );
      } else {
        this.data.fields[0].groupItems.push({
          groupMeta: { type: this.fieldTypes.activityDataset },
          source: {
            organization: {
              nameFi: 'Tiedejatutkimus.fi',
              nameSv: 'Forskning.fi',
              nameEn: 'Research.fi',
            },
          },
          items: result.selection,
        });
      }
    };

    // Set selected publications to field items
    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: any) => {
        // Reset sort when dialog closes
        this.searchPortalService.resetSort();

        if (result) {
          switch (groupId) {
            case 'publication': {
              handlePublications(result);
              break;
            }
            case 'dataset': {
              handleDatasets(result);
              break;
            }
          }

          this.updated = new Date();

          this.cdr.detectChanges();
        }
      });
  }
}
