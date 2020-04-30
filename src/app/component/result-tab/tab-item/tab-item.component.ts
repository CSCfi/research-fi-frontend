import { Component, OnInit, Input } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.scss']
})
export class TabItemComponent implements OnInit {
  @Input() tab: any;
  @Input() isHomepage = false;
  @Input() selectedTab: string;
  @Input() queryParams: any;
  @Input() counted: any;
  @Input() locale: string;

  constructor(public searchService: SearchService) { }

  ngOnInit(): void {
  }

}
