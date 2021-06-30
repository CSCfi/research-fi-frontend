import { Component, Input, OnInit, ViewEncapsulation } from '@angular/core';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { cloneDeep } from 'lodash-es';
import { checkGroupSelected, getDataSources } from '../../../utils';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { EditorModalComponent } from '../../profile-data-handler/editor-modal/editor-modal.component';
import { take } from 'rxjs/operators';
import { PatchService } from '@mydata/services/patch.service';

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

  constructor(public dialog: MatDialog, private patchService: PatchService) {}

  ngOnInit(): void {
    // Get data sources
    this.dataSources = getDataSources(this.data.profileData);

    this.primarySource = this.dataSources[0];
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

  openDialog(event, index) {
    event.stopPropagation();
    // this.selectedIndex = index;
    const selectedField = cloneDeep(this.data.profileData[index]);

    this.dialogRef = this.dialog.open(EditorModalComponent, {
      minWidth: '44vw',
      maxWidth: '100vw',
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
            console.log(
              'On editor modal close: ',
              this.patchService.currentPatchItems
            );
            this.data.profileData[index] = result.data;
            // this.patchData(result.patchGroups, result.patchItems);
          }

          this.patchService.clearPatchPayload();
        }
      );
  }
}
