import {
  Component,
  Input,
  OnInit,
  ElementRef,
  HostListener,
  Inject,
  OnDestroy,
  ViewChild,
  ViewEncapsulation,
} from '@angular/core';
import { DOCUMENT } from '@angular/common';
import { Subscription } from 'rxjs/internal/Subscription';
import { ResizeService } from '../../services/resize.service';
import { WINDOW } from '../../services/window.service';

@Component({
  selector: 'lib-navigation',
  templateUrl: './navigation.component.html',
  styleUrls: ['../shared.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NavigationComponent implements OnInit, OnDestroy {
  @Input() navItems: any;
  @Input() currentLang: any;
  @Input() currentRoute: any;
  mobile = this.window.innerWidth < 1200;
  height = this.window.innerHeight;
  width = this.window.innerWidth;
  navbarOpen = false;
  hideOverflow = true;
  dropdownOpen: any;
  lang: string;
  consent: string;
  private resizeSub: Subscription;
  @ViewChild('mainNavbar', { static: true }) mainNavbar: ElementRef;
  @ViewChild('navbarToggler', { static: true }) navbarToggler: ElementRef;

  constructor(
    private resizeService: ResizeService,
    @Inject(WINDOW) private window: any,
    @Inject(DOCUMENT) private document: any
  ) {}

  ngOnInit(): void {
    this.lang = this.currentLang.toUpperCase();
    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
  }

  @HostListener('document:keydown.escape', ['$event'])
  escapeListener(event: any) {
    if (this.mobile && this.navbarOpen) {
      this.toggleNavbar();
      setTimeout(() => {
        this.navbarToggler?.nativeElement.focus();
      }, 1);
    }
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;
    this.navbarOpen
      ? (this.document.body.style.overflow = 'hidden')
      : (this.document.body.style.overflow = 'visible');

    // Allow menu to slide out before hiding
    setTimeout(() => {
      this.hideOverflow = !this.hideOverflow;
    }, 250 * (1 - +this.navbarOpen));
  }

  onClickedOutside(e: Event) {
    this.dropdownOpen = false;
  }

  onResize(dims) {
    this.height = dims.height;
    this.width = dims.width;
    if (this.width >= 1200) {
      this.mobile = false;
      if (this.navbarOpen) {
        this.toggleNavbar();
      }
      if (this.mainNavbar) {
        this.mainNavbar.nativeElement.style.cssText = '';
      }
    } else {
      this.mobile = true;
    }
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }
}
