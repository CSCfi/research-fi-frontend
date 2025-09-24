import { Component, Input, OnInit } from '@angular/core';
import { GroupTypes } from '@mydata/constants/groupTypes';
import { NgClass, NgIf } from '@angular/common';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import { CdkCopyToClipboard } from '@angular/cdk/clipboard';
import { ShareComponent } from '@portal/components/single/share/share.component';
import { CapitalizeFirstLetterPipe } from '@shared/pipes/capitalize-first-letter.pipe';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Component({
    selector: 'app-name-and-orcid-view',
    imports: [
        NgIf,
        SvgSpritesComponent,
        TertiaryButtonComponent,
        NgClass,
        CdkCopyToClipboard,
        ShareComponent,
        CapitalizeFirstLetterPipe
    ],
    templateUrl: './name-and-orcid-view.component.html',
    styleUrl: './name-and-orcid-view.component.scss'
})
export class NameAndOrcidViewComponent implements OnInit {
  @Input() data: any;
  @Input() name: string;
  @Input() isEditorView: boolean;
  @Input() orcid: string;


  protected readonly groupTypes = GroupTypes;
  locale = 'Fi';
  positionTitleItem = undefined;
  positionTitles:string[] = [];
  positionTitleStr = '';
  fullName = '';

  constructor(private appSettingsService: AppSettingsService) {
  }

  copyLink(){
    //TODO: implement copy
  }

  ngOnInit(): void {
    this.locale = this.appSettingsService.capitalizedLocale;

    if (!this.isEditorView) {
      if (this.data[9].fields[0].items[0].fullName) {
        this.fullName = this.data[9].fields[0].items[0].fullName.trim();
      } else {
        this.fullName = this.data[9].fields[0].items[0]?.firstNames + ' ' + this.data[9].fields[0].items[0]?.lastName
      }
      this.positionTitleItem = this.data[2].fields[0].items.filter(item => item.itemMeta.primaryValue === true);
      if (this.positionTitleItem.length > 0) {
        if (Object.hasOwn(this.positionTitleItem[0], ('positionName' + this.locale))) {
          this.positionTitles = this.positionTitleItem.map((item) => item[('positionName' + this.locale)]);
          this.positionTitles = this.positionTitles.filter((item, index) => this.positionTitles.indexOf(item) === index).filter(item => item.length > 0);
          this.positionTitleStr = this.positionTitles.join(', ');
        }
      }
    }
  }
}
