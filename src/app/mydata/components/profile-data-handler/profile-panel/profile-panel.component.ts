//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import {
  AfterViewInit,
  Component,
  EventEmitter,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { Subscription } from 'rxjs';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { checkGroupSelected } from '../../../utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SearchPublicationsComponent } from './search-publications/search-publications.component';
import { take } from 'rxjs/operators';
import { PublicationsService } from '@mydata/services/publications.service';
import { faChevronDown, faChevronUp } from '@fortawesome/free-solid-svg-icons';
import { PatchService } from '@mydata/services/patch.service';

@Component({
  selector: 'app-profile-panel',
  templateUrl: './profile-panel.component.html',
})
export class ProfilePanelComponent implements OnInit, AfterViewInit {
  @Input() dataSources: any;
  @Input() primarySource: string;
  @Input() data: any;
  @Input() originalData: any;

  @Output() onGroupToggle = new EventEmitter<any>();
  @Output() onRadioItemToggle = new EventEmitter<any>();
  @Output() onSingleItemToggle = new EventEmitter<any>();
  @Output() onPrimaryValueChange = new EventEmitter<any>();
  @Output() onPublicationToggle = new EventEmitter<any>();

  allSelected: boolean;

  mobileStatusSub: Subscription;

  fieldTypes = FieldTypes;

  checkGroupSelected = checkGroupSelected;

  openPanels = [];

  // TODO: Dynamic locale
  locale = 'Fi';

  dialogRef: MatDialogRef<SearchPublicationsComponent>;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;

  disableAnimation = true;

  /*
   * appSettingsService is used in Template
   */
  constructor(
    private appSettingsService: AppSettingsService,
    public dialog: MatDialog,
    private publicationService: PublicationsService,
    private patchService: PatchService
  ) {}

  ngOnInit(): void {
    // this.setDefaultPrimaryValue(this.data.fields);
  }

  // Fix for Mat Expansion Panel render FOUC
  ngAfterViewInit(): void {
    // timeout required to avoid the dreaded 'ExpressionChangedAfterItHasBeenCheckedError'
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

  setPrimaryValue(option, data) {
    const patchItems = [];

    data.groupItems.map((groupItem) =>
      groupItem.items.forEach((item) => {
        // Set default primary value to false
        if (item.itemMeta.primaryValue === true) {
          item.itemMeta.primaryValue = false;
          patchItems.push(item.itemMeta);
        }

        // Set selected primary value and add to patch items
        if (item.itemMeta.id === option.id) {
          // Check item if chosen item isn't selected
          if (!item.itemMeta.show) item.itemMeta.show = true;

          item.itemMeta.primaryValue = true;
          patchItems.push(item.itemMeta);
        }
      })
    );

    this.onPrimaryValueChange.emit(patchItems);
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

    const original = this.originalData.data.fields[index];
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

    this.onRadioItemToggle.emit({
      data: group,
      selectedItem: selectedItem,
      index: index,
    });
  }

  toggleItem(event, groupItem, item, index) {
    if (item.itemMeta.primaryValue && !event.checked) {
      item.itemMeta.primaryValue = false;
      this.setDefaultPrimaryValue(this.data.fields);
    }

    this.patchService.addToPatchItems({
      ...item.itemMeta,
      show: event.checked,
    });

    this.onSingleItemToggle.emit({
      index: index,
      groupId: groupItem.groupMeta.id,
      itemMeta: {
        ...item.itemMeta,
        show: event.checked,
      },
    });
  }

  togglePublication(event, publication) {
    publication.show = event.checked;
    this.onPublicationToggle.emit();
  }

  removePublication(publication) {
    let selectedPublications = this.data.fields[0].selectedPublications;

    selectedPublications = selectedPublications.filter(
      (item) => item.id !== publication.id
    );

    this.data.fields[0].selectedPublications = selectedPublications;
  }

  // Search publications
  openDialog() {
    this.dialogRef = this.dialog.open(SearchPublicationsComponent, {
      minWidth: '44vw',
      maxWidth: '44vw',
      data: {
        selectedPublications: this.data.fields[0].selectedPublications,
      },
    });

    // Set selected publications to field items
    this.dialogRef
      .afterClosed()
      .pipe(take(1))
      .subscribe((result: { selectedPublications: any[] }) => {
        // Reset sort when dialog closes
        this.publicationService.resetSort();

        if (result) {
          const selectedPublications = this.data.fields[0].selectedPublications;

          if (result.selectedPublications) {
            const publicationArr = [];

            // Check if selection already exists. Set show status for previously selected items
            result.selectedPublications.forEach((publication) => {
              if (
                selectedPublications &&
                selectedPublications.find((item) => item.id === publication.id)
              ) {
                this.data.fields[0].selectedPublications.find(
                  (item) => item.id === publication.id
                ).show = publication.show;
              } else {
                publicationArr.push(publication);
              }
            });

            this.data.fields[0].selectedPublications = selectedPublications
              ? selectedPublications.concat(publicationArr)
              : result.selectedPublications;
          }
        }
      });
  }
}
