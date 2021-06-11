import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
})
export class ActivityItemComponent {
  @Input() rows: any[];

  constructor() {}
}
