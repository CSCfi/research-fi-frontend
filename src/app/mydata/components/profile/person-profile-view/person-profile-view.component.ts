import { Component, EventEmitter, Input, Output } from '@angular/core';
import {
  ProfileSummaryViewComponent
} from '@mydata/components/shared-layouts/profile-summary-view/profile-summary-view.component';
import { EditorModalComponent } from '@mydata/components/profile/editor-modal/editor-modal.component';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import { NgForOf, NgIf } from '@angular/common';

@Component({
  selector: 'app-person-profile-view',
  standalone: true,
  imports: [
    ProfileSummaryViewComponent,
    EditorModalComponent,
    HasSelectedItemsPipe,
    NgForOf,
    NgIf
  ],
  templateUrl: './person-profile-view.component.html',
  styleUrl: './person-profile-view.component.scss'
})
export class PersonProfileViewComponent {
  @Input() displayData: any;
  @Input() editControlsVisible: any;
  @Output() openDialog = new EventEmitter<number>();

  openDialogCall(event: any){
    this.openDialog.emit(event);
  }
}

