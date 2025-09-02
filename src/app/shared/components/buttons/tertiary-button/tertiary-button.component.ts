import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, Input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
  selector: 'app-tertiary-button',
  templateUrl: './tertiary-button.component.html',
  styleUrls: ['../buttons-shared.scss', './tertiary-button.component.scss'],
  standalone: true,
  imports: [
    MatRipple,
    NgIf,
    NgClass,
    SvgSpritesComponent
  ]
})
export class TertiaryButtonComponent {
  @Input() iconAfter: boolean;
  @Input() iconOnly: boolean;
  @Input() noSmIcon: boolean;
  @Input() content: string;
  @Input() disabled: boolean;
  @Input() big: boolean;
  @Input() small: boolean;
  @Input() px0: boolean;
  @Input() announce: boolean;
  @Input() announceText: string;
  @Input() svgSymbolName: string;
  @Input() svgCssClass: string;

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  handleFocus() {
    if (this.announce && this.announceText) {
      this.liveAnnouncer.announce(this.announceText);
    }
  }
}
