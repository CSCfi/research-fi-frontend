import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, Input, input } from '@angular/core';
import { NgIf, NgClass } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-primary-action-button',
    templateUrl: './primary-action-button.component.html',
    styleUrls: ['../buttons-shared.scss'],
    standalone: true,
  imports: [
    MatRipple,
    NgIf,
    NgClass,
    MatIcon,
    SvgSpritesComponent
  ]
})
export class PrimaryActionButtonComponent implements OnInit {
  @Input() iconAfter: boolean;
  @Input() noSmIcon: boolean;
  @Input() content: string;
  @Input() disabled: boolean;
  @Input() big: boolean;
  @Input() small: boolean;
  @Input() disabledRounded: boolean;
  @Input() betaButton: boolean;
  @Input() px0: boolean;
  @Input() announce: boolean;
  @Input() announceText: string;
  @Input() svgSymbolName: string;
  @Input() svgCssClass: string;

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {}

  handleFocus() {
    if (this.announce && this.announceText) {
      this.liveAnnouncer.announce(this.announceText);
    }
  }
}
