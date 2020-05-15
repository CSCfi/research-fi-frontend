import { Component, OnInit, Input, ViewChild, QueryList, AfterViewInit, ElementRef } from '@angular/core';
import { SearchService } from 'src/app/services/search.service';
import { SettingsService } from 'src/app/services/settings.service';
import { DataService } from 'src/app/services/data.service';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.scss']
})
export class TabItemComponent implements OnInit, AfterViewInit {
  @Input() tab: any;
  @Input() isHomepage = false;
  @Input() selectedTab: string;
  @Input() queryParams: any;
  @Input() counted: any;
  @Input() locale: string;
  targetQueryParams: any;

  @ViewChild('tabList') tabElem: ElementRef;

  constructor(public searchService: SearchService, private dataService: DataService, private settingsService: SettingsService) { }

  ngOnInit(): void {
    // Set target to params
    this.targetQueryParams = {...this.queryParams[this.tab.data], target: this.settingsService.target};
  }

  ngAfterViewInit(): void {
    if (this.tabElem) this.dataService.resultTabList.push(this.tabElem);
  }
}
