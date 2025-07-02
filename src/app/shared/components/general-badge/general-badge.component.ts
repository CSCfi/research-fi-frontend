import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-general-badge',
  standalone: true,
  imports: [],
  templateUrl: './general-badge.component.html',
  styleUrl: './general-badge.component.scss'
})
export class GeneralBadgeComponent {
  @Input() textInput: string;
}
