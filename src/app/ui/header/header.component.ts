// This file is part of the research.fi API service
//
// Copyright 2019 Ministry of Education and Culture, Finland
//
// :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
// :license: MIT

import { Component, OnInit, ViewChild, ElementRef, OnDestroy, Inject, LOCALE_ID, PLATFORM_ID, ViewChildren,
  AfterViewInit, ChangeDetectorRef, Renderer2, ViewEncapsulation} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { ResizeService } from '../../services/resize.service';
import { Subscription } from 'rxjs';
import { WINDOW } from 'src/app/services/window.service';
import { isPlatformBrowser } from '@angular/common';
import { Router, NavigationEnd } from '@angular/router';
import { UtilityService } from 'src/app/services/utility.service';
import { faChevronDown, faChevronUp, faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';
import { BetaReviewComponent } from './beta-review/beta-review.component';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HeaderComponent implements OnInit, OnDestroy, AfterViewInit {
  @ViewChild('mainNavbar', { static: true }) mainNavbar: ElementRef;
  @ViewChild('navbarToggler', { static: true }) navbarToggler: ElementRef;
  @ViewChild('overflowHider', { static: true }) overflowHider: ElementRef;
  @ViewChildren('navLink') navLink: any;

  navbarOpen = false;
  hideOverflow = true;
  dropdownOpen: any;
  mobile = this.window.innerWidth < 992;

  height = this.window.innerHeight;
  width = this.window.innerWidth;
  private resizeSub: Subscription;


  currentLang: string;
  lang: string;
  currentRoute: any;
  routeSub: Subscription;
  showSkipLinks: boolean;

  countTab = 0;
  navLinkArr: any;

  faChevronDown = faChevronDown;
  faChevronUp = faChevronUp;
  faTimesCircle = faTimesCircle;
  widthFlag: boolean;

  additionalWidth = 25;
  showReviewButton: boolean;
  onReview: boolean;
  betaReviewDialogRef: MatDialogRef<BetaReviewComponent>;

  constructor(private resizeService: ResizeService, @Inject( LOCALE_ID ) protected localeId: string,
              @Inject(WINDOW) private window: Window, @Inject(DOCUMENT) private document: any,
              @Inject(PLATFORM_ID) private platformId: object, private router: Router, private utilityService: UtilityService,
              private cdr: ChangeDetectorRef, private renderer: Renderer2,
              public dialog: MatDialog) {
    this.lang = localeId;
    this.currentLang = this.getLang(this.lang);
    this.routeEvent(router);
    this.widthFlag = false;
    this.showReviewButton = true;
  }

  // Get current url
  routeEvent(router: Router) {
    this.routeSub = router.events.subscribe(e => {
      if (e instanceof NavigationEnd) {
        // Prevent multiple anchors
        this.currentRoute = e.urlAfterRedirects.split('#')[0];

      }
    });
  }

  ngOnInit() {
    if (isPlatformBrowser(this.platformId)) {
      this.window.addEventListener('keydown', this.handleTabPressed);
      this.window.addEventListener('keydown', this.escapeListener);
      this.resizeSub = this.resizeService.onResize$.subscribe(dims => this.onResize(dims));
    }
  }

  ngAfterViewInit() {
    // if (!this.mobile) {
    //   const widths = this.navLink.map(th => th.nativeElement.offsetWidth + this.additionalWidth);
    //   this.navLink.forEach((item, index) => {
    //     this.renderer.setStyle(
    //       item.nativeElement,
    //       'width',
    //       `${widths[index]}px`
    //     );
    //   });
    //   this.widthFlag = true;
    // }
  }

  ngOnDestroy() {
    if (isPlatformBrowser(this.platformId)) {
      window.removeEventListener('keydown', this.handleTabPressed);
      window.removeEventListener('keydown', this.escapeListener);
      window.removeEventListener('mousedown', this.handleMouseDown);

      this.resizeSub.unsubscribe();
    }
    this.routeSub.unsubscribe();
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
    if (e.keyCode === 27 && this.mobile && !this.utilityService.modalOpen) {
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
      case 'fi': {
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

    // if (!this.mobile && !this.widthFlag) {
    //   setTimeout(x => {
    //     const widths = this.navLink.map(th => th.nativeElement.offsetWidth + this.additionalWidth);
    //     const arr = this.navLink.toArray();
    //     arr.forEach((item, index) => {
    //       this.renderer.setStyle(
    //         item.nativeElement,
    //         'width',
    //         `${widths[index]}px`
    //       );
    //     });
    //   }, 200);
    //   this.widthFlag = true;
    // }
  }

  onClickedOutside(e: Event) {
    this.dropdownOpen = false;
  }

  enter() {
    this.onReview = true;
  }

  leave() {
    this.onReview = false;
  }

  close() {
    this.showReviewButton = false;
  }

  toggleReview() {
    this.betaReviewDialogRef = this.dialog.open(BetaReviewComponent);
  }


}
