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
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
} from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { checkGroupSelected, isEmptySection } from '@mydata/utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchPortalComponent } from '../search-portal/search-portal.component';
import { PublicationsService } from '@mydata/services/publications.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { PatchService } from '@mydata/services/patch.service';
import { ProfileService } from '@mydata/services/profile.service';
import { cloneDeep } from 'lodash-es';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { CommonStrings } from '@mydata/constants/strings';
import { DatasetsService } from '@mydata/services/datasets.service';
import { FundingsService } from '@mydata/services/fundings.service';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
})
export class ProfilePanelComponent implements OnInit, OnChanges, AfterViewInit {
  @Input() primarySource: string;
  @Input() data: any;
  @Output() onSingleItemToggle = new EventEmitter<any>();

  allSelected: boolean;

  mobileStatusSub: Subscription;

  fieldTypes = FieldTypes;
  groupTypes = GroupTypes;

  checkGroupSelected = checkGroupSelected;
  isEmptySection = isEmptySection;

  maxItems = 7;
  openPanels = [];

  locale: string;

  showDialog: boolean;
  dialogData: any;
  currentGroupId: any;
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
    private profileService: ProfileService,
    private patchService: PatchService,
    private cdr: ChangeDetectorRef
  ) {
    this.locale = appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {
    const field = this.data.fields[0];

    // Combine items from groups
    const items = cloneDeep(field.items);
    if (items) {
      items.map((groupItem) => ({
        ...groupItem,
        source: groupItem.source,
      }));

      const result = [...items];

      this.combinedItems = result;
    } else {
      this.combinedItems = [];
    }
    // Merge publications that share DOI
    if (this.data.id === this.groupTypes.publication) {
      //mergePublications(field);
    }
    this.enableSaveForAddingName();
  }

  ngOnChanges() {
    this.cdr.detectChanges();
  }

  // Fix for Mat Expansion Panel render FOUC
  ngAfterViewInit(): void {
    setTimeout(() => (this.disableAnimation = false));
  }

  enableSaveForAddingName() {
    if (this.combinedItems[0]?.firstNames && this.combinedItems[0]?.lastName) {
      this.patchService.addToPayload({
        ...this.combinedItems[0].itemMeta,
        show: true,
      });
    }
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

    const currentSelection = group.items.find(
      (item) => item.itemMeta.id === event.value
    );

    group.items.map((groupItem) => {
      if (currentSelection) {
        selectedItem = currentSelection;
        patchObjects.push({ ...currentSelection.itemMeta, show: true });
      }

      groupItem.itemMeta.show =
        groupItem.itemMeta.id === event.value ? true : false;
    });

    const previousSelection = original.items.find((item) => item.itemMeta.show);

    if (previousSelection.itemMeta.id !== selectedItem.itemMeta.id)
      patchObjects.push({ ...previousSelection.itemMeta, show: false });

    // Remove patch items with type same as radio button item type
    this.patchService.removeItemsWithType(selectedItem.itemMeta.type);

    // Add to patch items
    this.patchService.addToPayload(patchObjects);
  }

  toggleItem(
    event: { checked: boolean },
    item: { itemMeta: { show: boolean } }
  ) {
    item.itemMeta.show = event.checked;

    this.onSingleItemToggle.emit();

    this.patchService.addToPayload({
      ...item.itemMeta,
      show: event.checked,
    });
  }

  toggleJoined(event, items) {
    items.map((item) => (item.itemMeta.show = event.checked));

    const patchItems = items.map((item) => item.itemMeta);

    this.onSingleItemToggle.emit();

    this.patchService.addToPayload(patchItems);
  }

  removeItem(
    groupType: number,
    itemToRemove: { id: string; itemMeta: { id: string | null } }
  ) {
    const field = this.data.fields[0];
    const items = field.items;

    this.data.fields[0].items = items.filter(
      (item) => item.itemMeta.id !== itemToRemove.itemMeta.id
    );

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
}
