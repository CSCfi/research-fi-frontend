import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { NgIf, NgClass } from '@angular/common';
import { MatRipple } from '@angular/material/core';
import { MatIcon } from '@angular/material/icon';

@Component({
    selector: 'app-secondary-button',
    templateUrl: './secondary-button.component.html',
    styleUrls: ['../buttons-shared.scss'],
    standalone: true,
  imports: [
    MatRipple,
    NgIf,
    FontAwesomeModule,
    NgClass,
    MatIcon
  ]
})
export class SecondaryButtonComponent implements OnInit {
  @Input() icon: IconDefinition;
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
  @Input() svgIconIdString: string;

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {}

  handleFocus() {
    if (this.announce && this.announceText) {
      this.liveAnnouncer.announce(this.announceText);
    }
  }
}
