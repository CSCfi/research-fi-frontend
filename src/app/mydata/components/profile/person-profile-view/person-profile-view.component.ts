import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ProfileSummaryViewComponent
} from '@mydata/components/shared-layouts/profile-summary-view/profile-summary-view.component';
import { EditorModalComponent } from '@mydata/components/profile/editor-modal/editor-modal.component';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import { JsonPipe, NgForOf, NgIf } from '@angular/common';
import {
  NameAndOrcidViewComponent
} from '@mydata/components/shared-layouts/name-and-orcid-view/name-and-orcid-view.component';

@Component({
    selector: 'app-person-profile-view',
    imports: [
        ProfileSummaryViewComponent,
        EditorModalComponent,
        HasSelectedItemsPipe,
        NgForOf,
        NgIf,
        NameAndOrcidViewComponent,
        JsonPipe
    ],
    templateUrl: './person-profile-view.component.html',
    styleUrl: './person-profile-view.component.scss'
})
export class PersonProfileViewComponent {
  @Input() displayData: any;
  @Input() name: any;
  @Input() orcid: any;
  @Input() isPortalSinglePage: boolean;
  @Input() highlightOpenness: boolean;
  @Output() openDialog = new EventEmitter<number>();

  openDialogCall(event: any){
    this.openDialog.emit(event);
  }
}

