import { ChangeDetectorRef, Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-figure-filters',
  templateUrl: './figure-filters.component.html',
  styleUrls: ['./figure-filters.component.scss']
})
export class FigureFiltersComponent implements OnInit, OnChanges {
  @Output() clicked = new EventEmitter<boolean>();
  @Output() filterData = new EventEmitter<boolean>();
  @Input() filter: any;
  filterHasBeenClicked: boolean;

  constructor(private route: ActivatedRoute, private router: Router, private cdr: ChangeDetectorRef) { }

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
