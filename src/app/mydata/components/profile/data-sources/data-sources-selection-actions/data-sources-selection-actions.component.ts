import {
  Component,
  EventEmitter,
  Input,
  OnDestroy,
  OnInit,
  Output,
} from '@angular/core';
import { Subscription, take } from 'rxjs';
import { DialogAction } from 'src/types';
import { PatchService } from '@mydata/services/patch.service';
import { ProfileService } from '@mydata/services/profile.service';
import { cloneDeep } from 'lodash-es';
import { HttpResponse } from '@angular/common/http';
import { SnackbarService } from '@mydata/services/snackbar.service';

type Action = 'publish' | 'hide' | 'share';

@Component({
  selector: 'app-data-sources-selection-actions',
  templateUrl: './data-sources-selection-actions.component.html',
  styleUrls: ['./data-sources-selection-actions.component.scss'],
})
export class DataSourcesSelectionActionsComponent implements OnInit, OnDestroy {
  @Input() selectedItems: any[];
  @Input() profileData: any[];

  filteredProfileData: any;

  actions: {
    id: Action;
    label: string;
    dialogTitle: string;
    dialogPreviewLabel: string;
    dialogPreviewLabelToggled: string;
    patchButtonLabel: string;
  }[] = [
    {
      id: 'publish',
      label: 'Aseta julkiseksi Tiedejatutkimus.fi:ssä',
      dialogTitle:
        'Aseta valitut tiedot julkiseksi Tiedejatutkimus.fi -palvelussa',
      dialogPreviewLabel: $localize`:@@showDataToPublish:Näytä julkaistavat tiedot`,
      dialogPreviewLabelToggled: $localize`:@@hideDataToPublish:Piilota julkaistavat tiedot`,
      patchButtonLabel: $localize`:@@publish:Julkaise`,
    },
    {
      id: 'hide',
      label: 'Piilota Tiedejatutkimus.fi:ssä',
      dialogTitle: 'Piilota valitut tiedot tiedejatutkimus.fi -palvelusta',
      dialogPreviewLabel: 'Näytä piilotettavat tiedot',
      dialogPreviewLabelToggled: 'Piilota piilotettavat tiedot',
      patchButtonLabel: 'Piilota',
    },
    // {
    //   id: 'share',
    //   label: 'Jaa kohteille...',
    //   dialogTitle: 'Jaa valitut tiedot kohteille',
    //   dialogPreviewLabel: 'Näytä jaettavat tiedot',
    //   dialogPreviewLabelToggled: 'Piilota jaettavat tiedot',
    //   patchButtonLabel: 'Jaa',
    // },
  ];

  // Dialog variables
  showDialog: boolean;
  dialogTemplate: any;
  dialogTitle: string;
  selectedAction: string = '';
  dialogActions: DialogAction[] = [
    {
      label: '',
      labelToggle: { on: '', off: '' },
      primary: false,
      method: 'preview',
      flexStart: true,
    },
    { label: $localize`:@@cancel:Peruuta`, primary: false, method: 'cancel' },
    { label: '', primary: true, method: '' },
  ];

  // For development purposes
  shareTargets = [
    { label: 'Tiedejatutkimus.fi' },
    { label: 'Organisaatio X' },
    { label: 'Palvelu Y' },
  ];

  patchItemsSub: Subscription;

  @Output() onPatchSuccess = new EventEmitter();

  filteredSelectedItems: any[];

  constructor(
    private patchService: PatchService,
    private profileService: ProfileService,
    private snackbarService: SnackbarService
  ) {}

  ngOnInit(): void {}

  openDialog(index: number) {
    this.patchService.confirmPayload();

    const action = this.actions[index];

    this.filterProfileData(action.id); // For draft summary

    this.showDialog = true;
    this.selectedAction = action.id;
    this.dialogTitle = action.dialogTitle;
    // Preview button content changes on toggle
    // Set initial label
    this.dialogActions[0].label = action.dialogPreviewLabel;
    this.dialogActions[0].labelToggle.on = action.dialogPreviewLabel;
    this.dialogActions[0].labelToggle.off = action.dialogPreviewLabelToggled;

    // Set patch button label and method
    this.dialogActions[2].label = action.patchButtonLabel;
    this.dialogActions[2].method = action.id;

    // Used for item count in action based selection indicator
    switch (action.id) {
      case 'publish': {
        this.filteredSelectedItems = this.selectedItems.filter(
          (item) => !item.itemMeta.show
        );
        break;
      }
      case 'hide': {
        this.filteredSelectedItems = this.selectedItems.filter(
          (item) => item.itemMeta.show
        );
        break;
      }
      default:
        this.filteredSelectedItems = this.selectedItems;
    }
  }

  closeDialog() {
    this.showDialog = false;
    this.selectedAction = '';
  }

  handleDialogAction(action: Action) {
    switch (action) {
      case 'publish':
        return this.patchItems('publish');
      case 'hide':
        return this.patchItems('hide');
    }
    this.closeDialog();
  }

  patchItems(action: Action) {
    const patchItemsArr = this.patchService.confirmedPayLoad;

    const filteredItems = patchItemsArr.filter((item) =>
      action === 'publish' ? item.show : !item.show
    );

    this.patchItemsSub = this.profileService
      .patchObjects(filteredItems)
      .pipe(take(1))
      .subscribe((res: HttpResponse<any>) => {
        if (res.body.success) {
          this.onPatchSuccess.emit(filteredItems);
          // Enable hide profile button in account settings section, if it has been disabled
          sessionStorage.removeItem('profileHidden');
          this.snackbarService.showPatchMessage('success');
        } else {
          this.snackbarService.showPatchMessage('error');
        }
      });
  }

  // Used as callback function in filter pipe
  filterByStatus(items, action: Action) {
    return items.filter((item) =>
      // filterBy utility function can't be used since it's outside of 'this'
      // scope when using filter pipe
      action === 'publish' ? !item.itemMeta.show : item.itemMeta.show
    );
  }

  // Get filtered data for draft summary in dialog
  // E.g. display only items that are public in 'hide' dialogs summary
  filterProfileData(action: Action) {
    const dataCopy = cloneDeep(this.profileData);

    const fields = dataCopy.flatMap((group) => group.fields);

    fields.forEach(
      (field) =>
        (field.items = field.items.filter((item) =>
          this.filterBy(action, item.itemMeta)
        ))
    );

    this.filteredProfileData = dataCopy;
  }

  // Utility function for profile data filter callback
  filterBy(action: string, item: { show: boolean }) {
    return action === 'publish' ? !item.show : item.show;
  }

  ngOnDestroy(): void {
    this.patchItemsSub?.unsubscribe();
  }
}
