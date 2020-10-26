import { ChangeDetectorRef, Component, EventEmitter, Inject, Input, LOCALE_ID, OnChanges, OnInit, Output } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-figure-filters',
  templateUrl: './figure-filters.component.html',
  styleUrls: ['./figure-filters.component.scss']
})
export class FigureFiltersComponent implements OnInit, OnChanges {
  @Output() clicked = new EventEmitter<boolean>();
  @Input() filter: any;
  @Input() narrow: boolean;
  filterHasBeenClicked: boolean;

  // Angular i18n xliff doesn't do well with html tags and therefore info content is translated in component by locale
  filters = [
    {label: $localize`:@@showAll:Näytä kaikki`, filter: 'all'},
    {label: $localize`:@@showOnlyTKIfilter:Näytä vain TKI-tiekartan seurantamittarit`,
      filter: 'roadmap',
      infoFi: 'Keväällä 2020 julkaistussa Valtioneuvoston <a href="https://minedu.fi/tki-tiekartta/tavoitteet-ja-paamaarat" target="_blank" class="external">TKI-tiekartassa <i class="fas fa-external-link-alt"></i></a> määritellyt tki-toiminnan seurantaindikaattorit.',
      infoEn: 'RDI activities’ follow up indicators defined in <a href="https://minedu.fi/en/rdi-roadmap/objectives-and-targets" target="_blank" class="external">the Government’s RDI roadmap <i class="fas fa-external-link-alt"></i></a>, published in spring 2020.',
      infoSv: 'Uppföljningsmätare för FUI-verksamhet definierat i <a href="https://minedu.fi/sv/fui-fardplan/mal-och-ambitioner" target="_blank" class="external">Statsrådets FUI-färdplan <i class="fas fa-external-link-alt"></i></a>, publicerad våren 2020.'
    },
  ];
  currentLocale: string;

  constructor(private router: Router, private cdr: ChangeDetectorRef, @Inject( LOCALE_ID ) protected localeId: string) {
    // Capitalize first letter of locale
    this.currentLocale = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
   }

  ngOnInit(): void {
  }

  ngOnChanges(): void {
    this.cdr.detectChanges();
  }

  // Navigate with params
  navigate(target) {
    this.filterHasBeenClicked = true;
    this.clicked.emit(true);
    this.router.navigate([], {queryParams: {filter: target}});
  }
}
