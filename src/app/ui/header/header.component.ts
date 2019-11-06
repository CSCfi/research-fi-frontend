// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Inject, LOCALE_ID, PLATFORM_ID } from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ResizeService } from '../../services/resize.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { isPlatformBrowser } from '@angular/common';

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

  mobile = this.window.innerWidth < 992;

  height = this.window.innerHeight;
  width = this.window.innerWidth;
  private resizeSub: Subscription;


  currentLang: string;
  lang: string;

  constructor(private resizeService: ResizeService, @Inject( LOCALE_ID ) protected localeId: string,
              @Inject(WINDOW) private window: Window, @Inject(DOCUMENT) private document: any,
              @Inject(PLATFORM_ID) private platformId: object) {
    this.lang = localeId;
    this.currentLang = this.getLang(this.lang);
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.window.addEventListener('keydown', this.handleTabPressed);
      this.window.addEventListener('keydown', this.escapeListener);
      this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
    }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('keydown', this.handleTabPressed);
      window.removeEventListener('keydown', this.escapeListener);
      window.removeEventListener('mousedown', this.handleMouseDown);

      this.resizeSub.unsubscribe();
    }
  }

  // Toggle between viewing and hiding focused element outlines
  handleTabPressed = (e: any): void => {
    if (e.keyCode === 9) {
      this.document.body.classList.add('user-tabbing');

      this.window.removeEventListener('keydown', this.handleTabPressed);
      this.window.addEventListener('mousedown', this.handleMouseDown);
    }
  }

  handleMouseDown = (): void => {
    this.document.body.classList.remove('user-tabbing');

    this.window.removeEventListener('mousedown', this.handleMouseDown);
    this.window.addEventListener('keydown', this.handleTabPressed);
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
    this.document.documentElement.lang = lang;
  }

  getLang(lang: string) {
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
    this.document.documentElement.lang = lang;
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
