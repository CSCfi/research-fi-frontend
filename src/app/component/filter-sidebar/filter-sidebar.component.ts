import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-filter-sidebar',
  templateUrl: './filter-sidebar.component.html',
  styleUrls: ['./filter-sidebar.component.scss']
})
export class FilterSidebarComponent implements OnInit {
  panelOpenState: boolean;
  expandStatus: Array<boolean> = [];
  sidebarOpen = false;
  mobile = window.innerWidth < 991;
  height = window.innerHeight;
  width = window.innerWidth;

  constructor() { }

  toggleNavbar() {
    this.sidebarOpen = !this.sidebarOpen;
    const elem = document.getElementById('filter-sidebar');

    if (this.sidebarOpen) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
    }
  }

  onResize(event) {
    const elem = document.getElementById('filter-sidebar');
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    if (this.width >= 991) {
      elem.style.display = 'block';
    } else {
      elem.style.display = 'none';
    }
  }

  ngOnInit() {
  }

}
