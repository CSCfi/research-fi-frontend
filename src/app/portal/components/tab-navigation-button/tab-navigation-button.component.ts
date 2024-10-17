import { Component, HostBinding, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CountUpModule } from 'ngx-countup';

@Component({
  selector: 'app-tab-navigation-button',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLink, CountUpModule],
  templateUrl: './tab-navigation-button.component.html',
  styleUrls: ['./tab-navigation-button.component.scss']
})
export class TabNavigationButtonComponent {
  @Input() label: string;
  @Input() count: number;

  @Input() routerLink: string;
  @Input() queryParams: any;

  @Input() active = false;
  @Input() disabled = false;

  @HostBinding('class.active') get isActive() { return this.active; }
  @HostBinding('class.not-active') get isNotActive() { return !this.active; }
  @HostBinding('class.disabled') get isDisabled() { return this.disabled; }

  countOps = {
    duration: 0.5,
    separator: ' ',
  };
}


