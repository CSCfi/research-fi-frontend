import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';

@Component({
  selector: 'app-profile-editor-card-header',
  templateUrl: './profile-editor-card-header.component.html',
})
export class ProfileEditorCardHeaderComponent implements OnInit {
  @Input() label: string;
  @Input() displayButton: boolean;
  @Output() handleOpenDialog = new EventEmitter();

  constructor() {}

  ngOnInit(): void {}

  openDialog() {
    this.handleOpenDialog.emit();
  }
}
