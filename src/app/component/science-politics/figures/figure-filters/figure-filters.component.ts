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
      infoFi: 'Kansallinen tutkimuksen, kehittämisen ja innovaatioiden tiekartta <a href="https://minedu.fi/tki-tiekartta" target="_blank" class="external">https://minedu.fi/tki-tiekartta <i class="fas fa-external-link-alt"></i></a>',
      infoEn: 'The National Roadmap for Research, Development and Innovation <a href="https://minedu.fi/en/rdi-roadmap" target="_blank" class="external">https://minedu.fi/en/rdi-roadmap <i class="fas fa-external-link-alt"></i></a>',
      infoSv: 'Den nationella färdplanen för forsknings-, utvecklings- och innovationsverksamhet <a href="https://minedu.fi/sv/fui-fardplan" target="_blank" class="external">https://minedu.fi/sv/fui-fardplan <i class="fas fa-external-link-alt"></i></a>'
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
