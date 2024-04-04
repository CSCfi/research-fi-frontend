import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  faAlignLeft,
  faBriefcase,
  faBullhorn,
  faCalculator,
  faFileAlt,
  faFileLines,
  faUniversity,
  faUsers
} from '@fortawesome/free-solid-svg-icons';
import { CountUpModule } from 'ngx-countup';
import { RouterLinkWithHref } from '@angular/router';

@Component({
  selector: 'app-tab-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, CountUpModule, RouterLinkWithHref],
  templateUrl: './tab-button.component.html',
  styleUrls: ['./tab-button.component.scss']
})
export class TabButtonComponent {
  @Input() label: string;
  @Input() count: number;
  @Input() route: string;

  countOps = {
    duration: 0.5,
    separator: ' ',
  };

  protected _icon = faFileLines;

  private iconMap = {
    'faFileLines': faFileLines,
    'faFileAlt': faFileAlt,
    'faUsers': faUsers,
    'faBriefcase': faBriefcase,
    'faAlignLeft': faAlignLeft,
    'faBullhorn': faBullhorn,
    'faCalculator': faCalculator,
    'faUniversity': faUniversity,
  };

  @Input() set icon(iconName: string) {
    if (this.iconMap[iconName]) {
      this._icon = this.iconMap[iconName];
    }
  }
}
