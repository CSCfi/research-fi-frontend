import { Component, Input, OnInit } from '@angular/core';
import { FundingCall } from '@portal/models/funding-call.model';

@Component({
  selector: 'app-funding-call-preview',
  templateUrl: './funding-call-preview.component.html',
  styleUrls: ['./funding-call-preview.component.scss']
})
export class FundingCallPreviewComponent implements OnInit {

  @Input() resultData: FundingCall[];
  constructor() { }

  ngOnInit(): void {
  }

}
