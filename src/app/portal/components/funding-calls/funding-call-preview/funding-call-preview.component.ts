import { Component, Input, OnInit } from '@angular/core';
import { Search } from '@portal/models/search.model';

@Component({
  selector: 'app-funding-call-preview',
  templateUrl: './funding-call-preview.component.html',
  styleUrls: ['./funding-call-preview.component.scss']
})
export class FundingCallPreviewComponent implements OnInit {

  @Input() resultData: Search;
  constructor() { }

  ngOnInit(): void {
  }

}
