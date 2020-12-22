import { ElementRef, Inject, OnDestroy, ViewChild } from '@angular/core';
import { Component, Input, OnInit } from '@angular/core';
import { Subscription } from 'rxjs/internal/Subscription';
import { ResizeService } from '../services/resize.service';
import { WINDOW } from '../services/window.service';

@Component({
  selector: 'lib-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit, OnDestroy {
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

  constructor(
    private resizeService: ResizeService,
    @Inject(WINDOW) private window: Window,
    ) {}

  ngOnInit(): void {
    this.resizeSub = this.resizeService.onResize$.subscribe((dims) =>
      this.onResize(dims)
    );
  }

  toggleNavbar() {
    this.navbarOpen = !this.navbarOpen;

    // Allow menu to slide out before hiding
    setTimeout(() => {
      this.hideOverflow = !this.hideOverflow;
    }, 250 * (1 - +this.navbarOpen));
  }

  setLang(lang: string) {}

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
      this.mainNavbar.nativeElement.style.cssText = '';
    } else {
      this.mobile = true;
    }
  }

  ngOnDestroy() {
    this.resizeSub?.unsubscribe();
  }
}
