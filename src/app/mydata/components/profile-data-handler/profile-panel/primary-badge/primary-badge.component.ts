import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-primary-badge',
  templateUrl: './primary-badge.component.html',
})
export class PrimaryBadgeComponent {
  @Input() label: string;

  constructor() {}
}
