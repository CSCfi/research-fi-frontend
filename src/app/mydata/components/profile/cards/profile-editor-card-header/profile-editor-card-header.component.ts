import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { SecondaryButtonComponent } from '../../../../../shared/components/buttons/secondary-button/secondary-button.component';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-profile-editor-card-header',
    templateUrl: './profile-editor-card-header.component.html',
    standalone: true,
    imports: [NgIf, SecondaryButtonComponent],
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
