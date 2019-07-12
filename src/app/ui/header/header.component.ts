// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild('mainNavbar') mainNavbar: ElementRef;
  @ViewChild('navbarToggler') navbarToggler: ElementRef;

  tabEventHandler: any;
  mouseEventHandler: any;
  escapeHandler: any;

  navbarOpen = false;

  mobile = window.innerWidth < 1217;

  height = window.innerHeight;
  width = window.innerWidth;

  lang = 'fi';

  constructor() { }

  ngOnInit() {
    this.tabEventHandler = this.handleTabPressed.bind(this);
    this.mouseEventHandler = this.handleMouseDown.bind(this);
    this.escapeHandler = this.escapeListener.bind(this);
    window.addEventListener('keydown', this.tabEventHandler);
    window.addEventListener('keydown', this.escapeHandler);
  }

  // Toggle between viewing and hiding focused element outlines
  handleTabPressed(e) {
    if (e.keyCode === 9) {
      document.body.classList.add('user-tabbing');

      window.removeEventListener('keydown', this.tabEventHandler);
      window.addEventListener('mousedown', this.mouseEventHandler);
    }
  }

  handleMouseDown() {
    document.body.classList.remove('user-tabbing');

    window.removeEventListener('mousedown', this.mouseEventHandler);
    window.addEventListener('keydown', this.tabEventHandler);
  }

  escapeListener(e) {
    if (e.keyCode === 27) {
      this.toggleNavbar();
      this.navbarToggler.nativeElement.focus();
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;

    // First change display: 'block' so animation works, then change position after a small timeout
    if (this.navbarOpen) {
      this.mainNavbar.nativeElement.style.cssText = 'display:block !important';

      setTimeout(() => {
        this.mainNavbar.nativeElement.style.right = '0';
      }, 10);

    } else {
      this.mainNavbar.nativeElement.style.cssText = 'display:none !important';
      this.mainNavbar.nativeElement.style.right = '-100%';
    }
  }

  setLang(lang: string) {
    this.lang = lang;
  }

  onResize(event) {
    this.height = window.innerHeight;
    this.width = window.innerWidth;
    if (this.width >= 1217) {
      this.mobile = false;
      if (this.navbarOpen) { this.toggleNavbar(); }
      this.mainNavbar.nativeElement.style.cssText = '';
    } else {
      this.mobile = true;
    }
  }
}
