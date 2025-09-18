import { Component, Input } from '@angular/core';

@Component({
    selector: 'app-general-badge',
    imports: [],
    templateUrl: './general-badge.component.html',
    styleUrl: './general-badge.component.scss'
})
export class GeneralBadgeComponent {
  @Input() textInput: string;
}
