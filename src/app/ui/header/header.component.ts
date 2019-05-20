// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  navbarOpen = false;

  collapse = 'closed';

  toggleCollapse() {
  // this.show = !this.show
    this.collapse = this.collapse === 'open' ? 'closed' : 'open';
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
    this.navbarOpen ? document.getElementById("mobile-menu").style.right = "0" : document.getElementById("mobile-menu").style.right = "-400px"; 
  }

  onResize(event) {
    if (event.target.innerWidth >= 992 && this.navbarOpen) this.toggleNavbar();
  }

  constructor() { }

  ngOnInit() {
  }

}
