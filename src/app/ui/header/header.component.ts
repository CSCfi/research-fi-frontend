// # This file is part of the research.fi API service
// #
// # Copyright 2019 Ministry of Education and Culture, Finland
// #
// # :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// # :license: MIT

import { Component, OnInit, ViewChild, ElementRef, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mainNavbar') mainNavbar: ElementRef;
  @ViewChild('navbarToggler') navbarToggler: ElementRef;

  navbarOpen = false;

  mobile = window.innerWidth < 1217;

  height = window.innerHeight;
  width = window.innerWidth;

  lang = 'fi';

  constructor() { }

  ngOnInit() {
    window.addEventListener('keydown', this.handleTabPressed);
    window.addEventListener('keydown', this.escapeListener);
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleTabPressed);
    window.removeEventListener('keydown', this.escapeListener);
    window.removeEventListener('mousedown', this.handleMouseDown);
  }

  // Toggle between viewing and hiding focused element outlines
  handleTabPressed = (e: any): void => {
    if (e.keyCode === 9) {
      document.body.classList.add('user-tabbing');

      window.removeEventListener('keydown', this.handleTabPressed);
      window.addEventListener('mousedown', this.handleMouseDown);
    }
  }

  handleMouseDown = (): void => {
    document.body.classList.remove('user-tabbing');

    window.removeEventListener('mousedown', this.handleMouseDown);
    window.addEventListener('keydown', this.handleTabPressed);
  }

  escapeListener = (e: any): void => {
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
