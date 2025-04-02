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
import { FindSelectedItemPipe } from '../../../pipes/find-selected-item.pipe';
import { JoinDataSourcesPipe } from '../../../pipes/join-data-sources.pipe';
import { FilterPipe } from '../../../pipes/filter.pipe';
import { JoinItemsPipe } from '../../../../shared/pipes/join-items.pipe';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { PrimaryBadgeComponent } from './primary-badge/primary-badge.component';
import { SecondaryButtonComponent } from '../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { PanelArrayItemComponent } from './panel-array-item/panel-array-item.component';
import { MatRadioButton } from '@angular/material/radio';
import { MatCheckbox } from '@angular/material/checkbox';
import { MatAccordion, MatExpansionPanel, MatExpansionPanelHeader, MatExpansionPanelTitle } from '@angular/material/expansion';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault } from '@angular/common';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-profile-panel',
    templateUrl: './profile-panel.component.html',
    standalone: true,
  imports: [
    NgIf,
    MatAccordion,
    NgFor,
    MatExpansionPanel,
    MatExpansionPanelHeader,
    MatExpansionPanelTitle,
    NgSwitch,
    NgSwitchCase,
    MatCheckbox,
    NgSwitchDefault,
    MatRadioButton,
    PanelArrayItemComponent,
    SecondaryButtonComponent,
    PrimaryBadgeComponent,
    FontAwesomeModule,
    SearchPortalComponent,
    JoinItemsPipe,
    FilterPipe,
    JoinDataSourcesPipe,
    FindSelectedItemPipe,
    SvgSpritesComponent
  ]
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
    let noNameSelected = true;
    this.combinedItems.forEach(item => {
      if (item?.firstNames && item?.lastName && item.itemMeta.show) {
        noNameSelected = false;
        // Add item to payload to enable publishing profile only with name
        this.patchService.addToPayload({
          ...item.itemMeta,
          show: true,
        });
      }
    });

    // Add first name occurence to payload, in case no name was visible
    if (noNameSelected) {
      this.combinedItems.every(item => {
        if (item?.firstNames && item?.lastName) {
          this.patchService.addToPayload({
            ...item.itemMeta,
            show: true,
          });
          return false;
        } else {
          return true;
        }
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
