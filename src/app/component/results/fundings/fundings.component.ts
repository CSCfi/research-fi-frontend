import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-fundings',
  templateUrl: './fundings.component.html',
  styleUrls: ['./fundings.component.scss']
})
export class FundingsComponent {
  @Input() resultData: any [];
  expandStatus: Array<boolean> = [];
}
