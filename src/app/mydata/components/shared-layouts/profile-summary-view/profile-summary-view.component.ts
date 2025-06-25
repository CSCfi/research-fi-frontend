import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { sortItemsByNew } from '@mydata/utils';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { GetItemsByPipe } from '@mydata/pipes/get-items-by.pipe';
import { SummaryDividerComponent } from '@mydata/components/profile/profile-summary/summary-divider/summary-divider.component';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe } from '@angular/common';
import { ModelUtilsService } from '@shared/services/model-util.service';
import { CheckLangPipe} from '@mydata/pipes/check-lang.pipe';
import { FieldTypes } from '@mydata/constants/fieldTypes';
import { HasSelectedItemsPipe } from '@mydata/pipes/has-selected-items.pipe';
import { JoinItemsPipe } from '@shared/pipes/join-items.pipe';
import {
  PanelArrayItemComponent
} from '@mydata/components/profile/profile-panel/panel-array-item/panel-array-item.component';
import { CommonStrings } from '@mydata/constants/strings';
import { TertiaryButtonComponent } from '@shared/components/buttons/tertiary-button/tertiary-button.component';
import { GroupTypes } from '@mydata/constants/groupTypes';
import {
  SummaryPortalItemsComponent
} from '@mydata/components/profile/profile-summary/summary-portal-items/summary-portal-items.component';
import { FormatAndSortTimespanPipe } from '@shared/pipes/format-and-sort-timespan.pipe';

@Component({
  selector: 'app-profile-summary-view',
  standalone: true,
  templateUrl: './profile-summary-view.component.html',
  styleUrl: './profile-summary-view.component.scss',
  imports: [
    NgIf,
    NgFor,
    SummaryDividerComponent,
    NgSwitch,
    NgSwitchCase,
    NgSwitchDefault,
    GetItemsByPipe,
    JsonPipe,
    CheckLangPipe,
    HasSelectedItemsPipe,
    JoinItemsPipe,
    PanelArrayItemComponent,
    TertiaryButtonComponent,
    SummaryPortalItemsComponent,
    FormatAndSortTimespanPipe
  ]
})


export class ProfileSummaryViewComponent implements OnInit  {
  @Input() data: any;
  @Input() isPortalSinglePage: any;
  @Input() sectionName: string;
  @Input() sectionIndex: number;
  @Output() openDialogCall = new EventEmitter<number>();

  editString = CommonStrings.reselect;
  selectString = CommonStrings.select;
  noPublicDataText = $localize`:@@youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;

  sortItemsByNew = sortItemsByNew;

  locale = 'Fi';

  columns = [
    {
      label: $localize`:@@organizationUnit:Organisaation yksikkö`,
      field: 'departmentName',
    },
    { label: $localize`:@@title:Nimike`, field: 'positionName' },
    {
      label: $localize`:@@researchCommunity:Tutkimusyhteisö`,
      field: 'researchCommunity',
    },
    {
      label: $localize`:@@roleInResearchCommunity:Rooli tutkimusyhteisössä`,
      field: 'roleInResearchCommunity',
    },
  ];

  constructor(private appSettingsService: AppSettingsService, private utils: ModelUtilsService) {}

  openDialog(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.openDialogCall.emit(index);
  }

  ngOnInit(): void {
    switch (this.sectionName) {
      case 'education': {
        //degree: this.utils.checkTranslation('name', item);
      }
    }

    this.locale = this.appSettingsService.capitalizedLocale;
  }

  protected readonly fieldTypes = FieldTypes;
  protected readonly groupTypes = GroupTypes;
}
