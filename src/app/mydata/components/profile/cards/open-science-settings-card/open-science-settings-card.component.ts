import { Component, EventEmitter, Output } from '@angular/core';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import {
  ProfileEditorCardHeaderComponent
} from '@mydata/components/profile/cards/profile-editor-card-header/profile-editor-card-header.component';
import { MatCheckbox } from '@angular/material/checkbox';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-open-science-settings-card',
  standalone: true,
  imports: [
    HasSelectedItemsPipe,
    ProfileEditorCardHeaderComponent,
    MatCheckbox,
    NgIf
  ],
  templateUrl: './open-science-settings-card.component.html',
  styleUrl: './open-science-settings-card.component.scss'
})

export class OpenScienceSettingsCardComponent {
  @Output() emitHighlightOpenness = new EventEmitter<boolean>();

   label = 'Highlight open science';
    highlightChecked = false;

    toggleChecked(){
      this.highlightChecked = !this.highlightChecked;
      this.emitHighlightOpenness.emit(this.highlightChecked);
    }
}
