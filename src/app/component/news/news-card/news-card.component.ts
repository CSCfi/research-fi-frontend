import { Component, OnInit, Input } from '@angular/core';
import { News } from 'src/app/models/news.model';

@Component({
  selector: 'app-news-card',
  templateUrl: './news-card.component.html',
  styleUrls: ['./news-card.component.scss']
})
export class NewsCardComponent implements OnInit {

  @Input() item: News;
  @Input() sideNews: boolean;
  constructor() { }

  ngOnInit(): void {
  }

}
