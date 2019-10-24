// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Inject, LOCALE_ID } from '@angular/core';
import { ResizeService } from '../../services/resize.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit, OnDestroy {
  @ViewChild('mainNavbar', { static: true }) mainNavbar: ElementRef;
  @ViewChild('navbarToggler', { static: true }) navbarToggler: ElementRef;
  @ViewChild('overflowHider', { static: true }) overflowHider: ElementRef;

  navbarOpen = false;
  hideOverflow = true;

  mobile = window.innerWidth < 992;

  height = window.innerHeight;
  width = window.innerWidth;
  private resizeSub: Subscription;

  lang: string;
  currentLang: string;

  constructor(private resizeService: ResizeService, @Inject( LOCALE_ID ) protected localeId: string) {
    this.lang = localeId;
    this.currentLang = this.displayLang(this.lang);
  }

  ngOnInit() {
    window.addEventListener('keydown', this.handleTabPressed);
    window.addEventListener('keydown', this.escapeListener);
    this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
  }

  ngOnDestroy() {
    window.removeEventListener('keydown', this.handleTabPressed);
    window.removeEventListener('keydown', this.escapeListener);
    window.removeEventListener('mousedown', this.handleMouseDown);
    this.resizeSub.unsubscribe();
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
    if (e.keyCode === 27 && this.mobile) {
      this.toggleNavbar();
      this.navbarToggler.nativeElement.focus();
    }
  }

  toggleNavbar() {
    // Toggle navbar state
    this.navbarOpen = !this.navbarOpen;

    // Allow menu to slide out before hiding
    setTimeout(() => {
      this.hideOverflow = !this.hideOverflow;
    }, 250 * (1 - +this.navbarOpen));
  }

  setLang(lang: string) {
    this.lang = lang;
    document.documentElement.lang = lang;
  }

  displayLang(lang: string) {
    let current = '';
    switch (lang) {
      case 'fi-FI': {
        current = 'FI';
        break;
      }
      case 'sv': {
        current = 'SV';
        break;
      }
      case 'en': {
        current = 'EN';
        break;
      }
    }
    return current;
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (this.width >= 992) {
      this.mobile = false;
      if (this.navbarOpen) { this.toggleNavbar(); }
      this.mainNavbar.nativeElement.style.cssText = '';
    } else {
      this.mobile = true;
    }
  }
}
