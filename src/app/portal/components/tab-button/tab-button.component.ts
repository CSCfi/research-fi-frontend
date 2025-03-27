import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { CountUpModule } from 'ngx-countup';
import { RouterLink } from '@angular/router';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-tab-button',
  standalone: true,
  imports: [CommonModule, FontAwesomeModule, CountUpModule, RouterLink, MatIcon, SvgSpritesComponent],
  templateUrl: './tab-button.component.html',
  styleUrls: ['./tab-button.component.scss']
})
export class TabButtonComponent {
  @Input() label: string;
  @Input() count: number;

  @Input() routerLink: string;
  @Input() queryParams: any;

  @Input() active = false;
  @Input() disabled = false;

  countOps = {
    duration: 0.5,
    separator: ' ',
  };

  protected _icon = '';

  @Input() set icon(iconName: string) {
    this._icon = iconName;
  }
}
