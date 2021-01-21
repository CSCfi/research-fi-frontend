import {
  Component,
  OnInit,
  Input,
  ViewChild,
  QueryList,
  AfterViewInit,
  ElementRef,
} from '@angular/core';
import { SearchService } from '@portal.services/search.service';
import { SettingsService } from '@portal.services/settings.service';
import { DataService } from '@portal.services/data.service';
import { UtilityService } from '@portal.services/utility.service';

@Component({
  selector: 'app-tab-item',
  templateUrl: './tab-item.component.html',
  styleUrls: ['./tab-item.component.scss'],
})
export class TabItemComponent implements OnInit, AfterViewInit {
  @Input() tab: any;
  @Input() isHomepage = false;
  @Input() selectedTab: string;
  @Input() queryParams: any;
  @Input() counted: any;
  @Input() locale: string;
  @Input() tooltipClass: string;
  @Input() count = false;
  targetQueryParams: any;

  // CountUp animation options
  countOps = {
    duration: 0,
    separator: ' ',
  };

  @ViewChild('tabList') tabElem: ElementRef;
  searchTermSub: any;

  constructor(
    public searchService: SearchService,
    private dataService: DataService,
    private settingsService: SettingsService,
    public utilityService: UtilityService
  ) {}

  ngOnInit(): void {
    // Set target to params
    this.targetQueryParams = {
      ...this.queryParams[this.tab.data],
      target: this.settingsService.target,
      size: this.searchService.pageSize,
    };

    // Subscribe to search term, animate tab count if search term changes
    this.searchTermSub = this.searchService.currentInput.subscribe(() => {
      this.countOps.duration = 0.5;
    });
  }

  ngAfterViewInit(): void {
    if (this.tabElem) {
      this.dataService.resultTabList.push(this.tabElem);
    }
  }
}
