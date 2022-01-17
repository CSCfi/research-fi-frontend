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
import {
  checkGroupSelected,
  isEmptySection,
  mergePublications,
} from '@mydata/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchPortalComponent } from '../search-portal/search-portal.component';
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
import { FundingsService } from '@mydata/services/fundings.service';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
})
export class ProfilePanelComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() primarySource: string;
  @Input() data: any;

  allSelected: boolean;

  mobileStatusSub: Subscription;

  fieldTypes = FieldTypes;
  groupTypes = GroupTypes;

  checkGroupSelected = checkGroupSelected;
  isEmptySection = isEmptySection;

  maxItems = 7;
  openPanels = [];

  locale: string;

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
    private fundingsService: FundingsService,
    private searchPortalService: SearchPortalService,
    private profileService: ProfileService,
    private patchService: PatchService,
    private cdr: ChangeDetectorRef
  ) {
    this.locale = appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    const field = this.data.fields[0];

    // Combine items from groups
    const groupItems = cloneDeep(field.groupItems);

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

    // Merge publications that share DOI
    if (this.data.id === this.groupTypes.publication) {
      mergePublications(field);
    }
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  // Fix for Mat Expansion Panel render FOUC
  ngAfterViewInit(): void {
    setTimeout(() => (this.disableAnimation = false));
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
    this.patchService.addToPayload(patchObjects);
  }

  toggleItem(event, groupItem, item, index) {
    const groupMeta = groupItem.groupMeta;

    const parentGroup = this.data.fields[index].groupItems.find(
      (group: { groupMeta: { id: any } }) => group.groupMeta.id === groupMeta.id
    );

    const currentItem = parentGroup.items.find(
      (i: { itemMeta: { id: any } }) => i.itemMeta.id === item.itemMeta.id
    );

    currentItem.itemMeta.show = event.checked;

    this.patchService.addToPayload({
      ...item.itemMeta,
      show: event.checked,
    });
  }

  toggleJoined(event, groupItem) {
    groupItem.items.map((item) => (item.itemMeta.show = event.checked));

    const patchItems = groupItem.items.map((item) => item.itemMeta);

    this.patchService.addToPayload(patchItems);
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
      case this.fieldTypes.activityPublication: {
        this.publicationsService.addToDeletables(itemToRemove);
        break;
      }
      case this.fieldTypes.activityDataset: {
        this.datasetsService.addToDeletables(itemToRemove);
        break;
      }
      case this.fieldTypes.activityFunding: {
        this.fundingsService.addToDeletables(itemToRemove);
        break;
      }
    }

    this.updated = new Date();
  }

  /*
   * Dynamic search from portal modal
   * Search for Publications, Datasets and Fundings
   */
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

    type Result = { selection: any[] };

    /*
     * Use group related service to add selected items into draft view and patch payload
     */
    const handlePortalItems = (groupId: string, result: Result) => {
      let service: PublicationsService | DatasetsService | FundingsService;
      let fieldType: number;

      switch (groupId) {
        case 'publication': {
          service = this.publicationsService;
          fieldType = this.fieldTypes.activityPublication;
          break;
        }
        case 'dataset': {
          service = this.datasetsService;
          fieldType = this.fieldTypes.activityDataset;
          break;
        }
        case 'funding': {
          service = this.fundingsService;
          fieldType = this.fieldTypes.activityFunding;
          break;
        }
      }

      service.addToPayload(result.selection);

      const groupItems = this.data.fields[0].groupItems;

      // Items with primary value
      let existingAddedItems = groupItems.find((group) =>
        group.items.find((item) => item.itemMeta.primaryValue)
      );

      if (existingAddedItems) {
        existingAddedItems.items = existingAddedItems.items.concat(
          result.selection
        );
      } else {
        groupItems.push({
          groupMeta: { type: fieldType },
          source: {
            organization: {
              name: CommonStrings.ttvLabel,
            },
          },
          items: result.selection,
        });
      }

      // Merge publications that share DOI
      // Select merged ORCID item
      if (this.data.id === 'publications') {
        const field = this.data.fields[0];

        mergePublications(field);

        const merged = field.groupItems[0].merged;
        this.patchService.addToPayload(merged);
      }
    };

    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: any) => {
        // Reset sort when dialog closes
        this.searchPortalService.resetSort();

        if (result) {
          // Add selected items into profile data and patch payload
          handlePortalItems(groupId, result);

          this.updated = new Date();

          this.cdr.detectChanges();
        }
      });
  }
}
