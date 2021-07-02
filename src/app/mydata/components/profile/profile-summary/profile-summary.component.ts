import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { cloneDeep } from 'lodash-es';
import { checkGroupSelected, getDataSources } from '../../../utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from '../../profile-data-handler/editor-modal/editor-modal.component';
import { take } from 'rxjs/operators';
import { PatchService } from '@mydata/services/patch.service';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { ProfileService } from '@mydata/services/profile.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-profile-summary',
  templateUrl: './profile-summary.component.html',
  styleUrls: ['./profile-summary.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class ProfileSummaryComponent implements OnInit {
  @Input() data: any;

  fieldTypes = FieldTypes;

  selectedData: any;

  checkGroupSelected = checkGroupSelected;
  getDataSources = getDataSources;

  dataSources: any[];
  primarySource: string;

  // TODO: Dynamic locale
  locale = 'Fi';

  dialogRef: MatDialogRef<EditorModalComponent>;

  constructor(
    private appSettingsService: AppSettingsService,
    private snackBar: MatSnackBar,
    public dialog: MatDialog,
    private patchService: PatchService,
    private profileService: ProfileService
  ) {}

  ngOnInit(): void {
    // Get data sources
    this.dataSources = getDataSources(this.data.profileData);

    this.primarySource = this.dataSources[0];

    this.sortPublications(this.data.profileData);
  }

  getSelectedItems() {
    const dataCopy = cloneDeep(this.data.profileData);

    for (let group of dataCopy) {
      group.fields.forEach((field) => {
        field.groupItems.map(
          (groupItem) =>
            (groupItem.items = groupItem.items.filter(
              (item) => item.itemMeta.show
            ))
        );

        field.groupItems = field.groupItems.filter(
          (groupItem) => groupItem.items.length
        );
      });

      group.fields = group.fields.filter((field) => field.groupItems.length);
    }

    this.selectedData = dataCopy.filter((item) => item.fields.length);
  }

  sortPublications(data) {
    const index = data.findIndex((item) => item.label === 'Julkaisut');

    const items = data[index].fields[0].groupItems.flatMap(
      (groupItem) => groupItem.items
    );

    // Combine groups and sort. Display items in summary only from first group
    const sortedItems = items.sort(
      (a, b) => b.publicationYear - a.publicationYear
    );

    data[index].fields[0].groupItems[0].items = sortedItems;

    this.data.profileData[index].fields[0].groupItems = [
      data[index].fields[0].groupItems[0],
    ];
  }

  openDialog(event, index) {
    event.stopPropagation();
    let mobile: boolean;

    const selectedField = cloneDeep(this.data.profileData[index]);

    this.appSettingsService.mobileStatus.pipe(take(1)).subscribe((status) => {
      mobile = status;
    });

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      minWidth: '44vw',
      maxWidth: mobile ? '100vw' : '44vw',
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
          if (result) {
            const currentPatchItems = this.patchService.currentPatchItems;
            console.log('On editor modal close: ', currentPatchItems);
            this.data.profileData[index] = result.data;
            this.patchItems(currentPatchItems);
          }

          this.patchService.clearPatchPayload();
        }
      );
  }

  patchItems(patchItems) {
    this.profileService
      .patchObjects(patchItems)
      .pipe(take(1))
      .subscribe((response) => {
        console.log(response);
        this.snackBar.open('Muutokset tallennettu', 'Sulje', {
          horizontalPosition: 'start',
        });
        // TODO: Alert when error
      });
  }
}
