import { Component, EventEmitter, Input, Output } from '@angular/core';
import { EditorModalComponent } from '@mydata/components/profile/editor-modal/editor-modal.component';
import { EmptyCardComponent } from '@mydata/components/profile/cards/empty-card/empty-card.component';
import { FilterPipe } from '@mydata/pipes/filter.pipe';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import { JoinAllGroupItemsPipe } from '@mydata/pipes/join-all-group-items.pipe';
import { JsonPipe, NgForOf, NgIf, NgSwitch, NgSwitchCase } from '@angular/common';
import {
  ProfileEditorCardHeaderComponent
} from '@mydata/components/profile/cards/profile-editor-card-header/profile-editor-card-header.component';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { checkGroupSelected } from '@mydata/utils';

@Component({
    selector: 'app-contact-info-view',
    imports: [
        EditorModalComponent,
        EmptyCardComponent,
        FilterPipe,
        HasSelectedItemsPipe,
        JoinAllGroupItemsPipe,
        NgForOf,
        NgIf,
        NgSwitchCase,
        ProfileEditorCardHeaderComponent,
        SvgSpritesComponent,
        NgSwitch,
        JsonPipe
    ],
    templateUrl: './contact-info-view.component.html',
    styleUrl: './contact-info-view.component.scss'
})
export class ContactInfoViewComponent {
  @Input() contactFields: string;
  @Input() data: any;
  @Input() label: string;
  @Input() isEditorView: boolean;
  @Output() handleOpenDialog = new EventEmitter();

  publishedFullname: string;
  publishedFullnameLabel: string;
  isEmailVisible: boolean;


  showEmail() {
    this.isEmailVisible = true;
  }

  checkGroupSelected = checkGroupSelected;
  fieldTypes = FieldTypes;

  openDialog(event: any) {
    this.handleOpenDialog.emit(event);
  }
}
