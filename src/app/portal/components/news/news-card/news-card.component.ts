import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { News } from 'src/app/portal/models/news.model';
import { FundingCall } from '@portal/models/funding-call.model';

@Component({
  selector: 'app-news-card',
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss'],
  encapsulation: ViewEncapsulation.None,
})
export class NewsCardComponent implements OnInit {
  @Input() itemTypeFundingCalls = false;
  @Input() item: News;
  @Input() set fundingCall(fundingCall: FundingCall) {
    this._fundingCall = fundingCall;
  }

  @Input() dense: boolean;
  @Input() isHomepage = false;
  @Input() term: string;

  public _fundingCall: FundingCall;

  constructor() {
    this.term = this.term?.replace(/ä/g, '&auml;').replace(/ö/g, '&ouml;');
  }

  ngOnInit(): void {
  }
}
