import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent implements OnInit {
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  constructor() { }

  ngOnInit() {
  }

}
