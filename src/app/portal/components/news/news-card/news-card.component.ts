import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { News } from 'src/app/portal/models/news.model';
import { FundingCall } from '@portal/models/funding-call.model';
import { SafeUrlPipe } from '../../../pipes/safe-url.pipe';
import { HighlightSearchPipe } from '../../../pipes/highlight.pipe';
import { CutContentPipe } from '../../../../shared/pipes/cut-content.pipe';
import { RouterLink } from '@angular/router';
import { NgIf, NgSwitch, NgSwitchCase, NgSwitchDefault, NgClass, DatePipe } from '@angular/common';
import { MatCard, MatCardHeader, MatCardTitle, MatCardSubtitle, MatCardContent, MatCardActions, MatCardFooter } from '@angular/material/card';
import { SvgSpritesComponent } from '@shared/components/svg-sprites/svg-sprites.component';

@Component({
    selector: 'app-news-card',
    templateUrl: './news-card.component.html',
    styleUrls: ['./news-card.component.scss'],
    encapsulation: ViewEncapsulation.None,
    imports: [
        MatCard,
        MatCardHeader,
        MatCardTitle,
        NgIf,
        NgSwitch,
        NgSwitchCase,
        NgSwitchDefault,
        RouterLink,
        MatCardSubtitle,
        MatCardContent,
        NgClass,
        MatCardActions,
        MatCardFooter,
        DatePipe,
        CutContentPipe,
        HighlightSearchPipe,
        SafeUrlPipe,
        SvgSpritesComponent
    ]
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
