import {
  ChangeDetectorRef,
  Component,
  EventEmitter,
  Input,
  OnChanges,
  OnInit,
  Output,
  ViewEncapsulation,
} from '@angular/core';
import { Router } from '@angular/router';
import { AppSettingsService } from '@shared/services/app-settings.service';
import { FiguresInfoComponent } from '../figures-info/figures-info.component';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';
import { NgFor, NgIf } from '@angular/common';

@Component({
    selector: 'app-figure-filters',
    templateUrl: './figure-filters.component.html',
    styleUrls: ['./figure-filters.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        NgFor,
        MatChipListbox,
        MatChipOption,
        NgIf,
        FiguresInfoComponent,
    ]
})
export class FigureFiltersComponent implements OnInit, OnChanges {
  @Output() clicked = new EventEmitter<boolean>();
  @Input() filter: any;
  @Input() narrow: boolean;
  filterHasBeenClicked: boolean;

  // Angular i18n xliff doesn't do well with html tags and therefore info content is translated in component by locale
  filters = [
    { label: $localize`:@@showAll:Näytä kaikki`, filter: 'all' },
    {
      label: $localize`:@@showOnlyTKIfilter:Näytä vain TKI-tiekartan seurantamittarit`,
      filter: 'roadmap',
      infoFi:
        'Keväällä 2020 julkaistussa Valtioneuvoston <a href="https://okm.fi/tki-tiekartta" target="_blank" class="external">TKI-tiekartassa <i class="fas fa-external-link-alt"></i></a> määritellyt tki-toiminnan seurantaindikaattorit.',
      infoEn:
        'RDI activities’ follow up indicators defined in <a href="https://okm.fi/en/rdi-roadmap" target="_blank" class="external">the Government’s RDI roadmap <i class="fas fa-external-link-alt"></i></a>, published in spring 2020.',
      infoSv:
        'Uppföljningsmätare för FUI-verksamhet definierat i <a href="https://okm.fi/sv/fui-fardplan" target="_blank" class="external">Statsrådets FUI-färdplan <i class="fas fa-external-link-alt"></i></a>, publicerad våren 2020.',
    },
  ];
  currentLocale: string;

  constructor(
    private router: Router,
    private cdr: ChangeDetectorRef,
    private appSettingsService: AppSettingsService
  ) {
    this.currentLocale = this.appSettingsService.capitalizedLocale;
  }

  ngOnInit(): void {}

  ngOnChanges(): void {
    this.cdr.detectChanges();
  }

  // Navigate with params
  navigate(target) {
    this.filterHasBeenClicked = true;
    this.clicked.emit(true);
    this.router.navigate([], { queryParams: { filter: target } });
  }
}
