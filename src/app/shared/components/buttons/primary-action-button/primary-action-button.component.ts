import { LiveAnnouncer } from '@angular/cdk/a11y';
import { Component, OnInit, Input } from '@angular/core';
import { IconDefinition } from '@fortawesome/free-solid-svg-icons';

@Component({
  selector: 'app-primary-action-button',
  templateUrl: './primary-action-button.component.html',
  styleUrls: ['../buttons-shared.scss'],
})
export class PrimaryActionButtonComponent implements OnInit {
  @Input() icon: IconDefinition;
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

  constructor(private liveAnnouncer: LiveAnnouncer) {}

  ngOnInit(): void {}

  handleFocus() {
    if (this.announce && this.announceText) {
      this.liveAnnouncer.announce(this.announceText);
    }
  }
}
