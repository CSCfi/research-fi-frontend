import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-activity-item',
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss'],
})
export class ActivityItemComponent {
  @Input() rows: any[];

  constructor() {}
}
