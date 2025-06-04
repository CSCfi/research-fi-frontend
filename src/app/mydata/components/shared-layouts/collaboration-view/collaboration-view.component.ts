import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { DialogComponent } from '@shared/components/dialog/dialog.component';
import { EmptyCardComponent } from '@mydata/components/profile/cards/empty-card/empty-card.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgForOf, NgIf } from '@angular/common';
import {
  ProfileEditorCardHeaderComponent
} from '@mydata/components/profile/cards/profile-editor-card-header/profile-editor-card-header.component';
import { MatDialog } from '@angular/material/dialog';
import { CollaborationsService } from '@mydata/services/collaborations.service';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
  selector: 'app-collaboration-view',
  standalone: true,
  imports: [
    DialogComponent,
    EmptyCardComponent,
    MatCheckbox,
    NgForOf,
    NgIf,
    ProfileEditorCardHeaderComponent
  ],
  templateUrl: './collaboration-view.component.html',
  styleUrl: './collaboration-view.component.scss'
})
export class CollaborationViewComponent implements OnInit {
  @Input() collaborationOptions: [];
  @Input() label: string;
  @Input() hasCheckedOption: boolean;
  @Input() hasEditRights: boolean;
  @Output() handleOpenDialog = new EventEmitter();

  nameLocale = '';

  constructor(
    private appSettingsService: AppSettingsService
  ) {}

  openDialog(){
    this.handleOpenDialog.emit();
  }

  ngOnInit(): void {
    this.nameLocale = 'name' + this.appSettingsService.capitalizedLocale;
  }
}

