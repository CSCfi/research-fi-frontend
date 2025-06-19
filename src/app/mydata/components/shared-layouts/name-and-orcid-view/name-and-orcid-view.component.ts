import { Component, Input } from '@angular/core';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { NgClass, NgIf } from '@angular/common';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { ShareComponent } from '@portal/components/single/share/share.component';

@Component({
  selector: 'app-name-and-orcid-view',
  standalone: true,
  imports: [
    NgIf,
    SvgSpritesComponent,
    TertiaryButtonComponent,
    NgClass,
    CdkCopyToClipboard,
    ShareComponent
  ],
  templateUrl: './name-and-orcid-view.component.html',
  styleUrl: './name-and-orcid-view.component.scss'
})
export class NameAndOrcidViewComponent {
  @Input() name: any;
  @Input() orcid: string;
  @Input() isEditorView: boolean;

  protected readonly groupTypes = GroupTypes;

  copyLink(){
    //TODO: implement copy
  }
}
