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

  mobile = window.innerWidth < 992;

  height = window.innerHeight;
  width = window.innerWidth;
  
  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
    const elem = document.getElementById("main-navbar");
    if (this.navbarOpen) {
      elem.style.right = "0";
    } else {
      elem.style.right = "-100%";
    }
  }
  
  onResize(event) {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    if (this.width >= 992) {
      this.mobile = false;
      if (this.navbarOpen) this.toggleNavbar();
    } else {
      this.mobile = true;
    }
  }
  constructor() { }

  ngOnInit() {
  }

}
