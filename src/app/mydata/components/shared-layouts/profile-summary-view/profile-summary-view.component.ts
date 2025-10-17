import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { sortItemsByNew } from '@mydata/utils';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { GetItemsByPipe } from '@mydata/pipes/get-items-by.pipe';
import { SummaryDividerComponent } from '@mydata/components/profile/profile-summary/summary-divider/summary-divider.component';
import { NgIf, NgFor, NgSwitch, NgSwitchCase, NgSwitchDefault, JsonPipe, AsyncPipe } from '@angular/common';
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
import { GeneralBadgeComponent } from '@shared/components/general-badge/general-badge.component';
import { CountSelectedItemsPipe } from '@mydata/pipes/count-selected-items.pipe';
import {
  SortDropdownMenuComponent
} from '@mydata/components/shared-layouts/profile-summary-view/sort-dropdown-menu/sort-dropdown-menu.component';
import { BehaviorSubject } from 'rxjs';
import { checkTranslation } from '@portal/models/person/profiletool-person-adapter';

@Component({
    selector: 'app-profile-summary-view',
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
        FormatAndSortTimespanPipe,
        GeneralBadgeComponent,
        CountSelectedItemsPipe,
        SortDropdownMenuComponent,
        AsyncPipe
    ]
})


export class ProfileSummaryViewComponent implements OnInit  {
  @Input() data: any;
  @Input() isPortalSinglePage: any;
  @Input() sectionName: string;
  @Input() sectionIndex: number;
  @Input() highlightOpenness: boolean;
  @Output() openDialogCall = new EventEmitter<number>();

  primary = $localize`:@@primary:Ensisijainen`;
  editString = CommonStrings.reselect;
  selectString = CommonStrings.select;
  noPublicDataText = $localize`:@@youHaveNotSelectedAnyPublicData:Et ole vielä valinnut julkisesti näytettäviä tietoja`;

  sortByText = $localize`:@@sortBy:Lajittele`;
  byYearText = $localize`:@@sortByYear:vuoden mukaan`;
  byOpennessText = $localize`:@@sortByOpenness:avoimen saatavuuden mukaan`;

  highlightOpennessDropdownSelection = new BehaviorSubject(undefined);
  highlightOpennessState = new BehaviorSubject(false);

  sortItemsByNew = sortItemsByNew;
  showSortMenu = false;

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

  constructor(private appSettingsService: AppSettingsService, private utils: ModelUtilsService, @Inject(LOCALE_ID) protected locale: string) {}

  openDialog(event: MouseEvent, index: number) {
    event.stopPropagation();
    this.openDialogCall.emit(index);
  }

  showSortMenuClick() {
    this.showSortMenu = !this.showSortMenu;
  }

  setHighlightingOpennessSelection(input: number) {
    this.highlightOpennessDropdownSelection.next(input);
    this.highlightOpennessState.next(input === 0 ? true : false);
  }

  ngOnInit(): void {
    switch (this.sectionName) {
      case 'education': {
        if (this.data) {
          this.data.items.map((item) => {
            item.name = checkTranslation('name', item, this.locale);
          });
        }
      }
    }
    this.locale = this.appSettingsService.capitalizedLocale;
    this.highlightOpennessDropdownSelection.next(this.highlightOpenness === true ? 0 : 1);
    this.highlightOpennessState.next(this.highlightOpenness);
  }

  protected readonly fieldTypes = FieldTypes;
  protected readonly groupTypes = GroupTypes;
}
