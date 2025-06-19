import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SecondaryButtonComponent } from '../../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { NgIf } from '@angular/common';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';

@Component({
  selector: 'app-profile-editor-card-header',
  styleUrls: ['./profile-editor-card-header.component.scss'],
  templateUrl: './profile-editor-card-header.component.html',
  standalone: true,
  imports: [NgIf, SecondaryButtonComponent, TertiaryButtonComponent]
})
export class ProfileEditorCardHeaderComponent implements OnInit {
  @Input() label: string;
  @Input() displayButton: boolean;
  @Output() handleOpenDialog = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  openDialog(event: MouseEvent) {
    this.handleOpenDialog.emit(event);
  }
}
