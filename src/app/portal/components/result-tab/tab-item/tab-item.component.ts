import {
  Component,
  OnInit,
  Input,
  ViewChild,
  QueryList,
  AfterViewInit,
  ElementRef,
  OnChanges,
  OnDestroy,
} from '@angular/core';
import { SearchService } from 'src/app/portal/services/search.service';
import { SettingsService } from 'src/app/portal/services/settings.service';
import { DataService } from 'src/app/portal/services/data.service';
import { UtilityService } from 'src/app/shared/services/utility.service';
import { CountUpModule } from 'ngx-countup';
import { NgIf, AsyncPipe } from '@angular/common';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-tab-item',
    templateUrl: './tab-item.component.html',
    styleUrls: ['./tab-item.component.scss'],
    standalone: true,
    imports: [
        RouterLink,
        NgIf,
        CountUpModule,
        AsyncPipe,
    ],
})
export class TabItemComponent
  implements OnInit, AfterViewInit, OnChanges, OnDestroy
{
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
    // Subscribe to search term, animate tab count if search term changes
    this.searchTermSub = this.searchService.currentInput.subscribe(() => {
      this.countOps.duration = 0.5;
    });
  }

  ngOnChanges(): void {
    // Set target to params
    this.targetQueryParams = {
      ...this.queryParams[this.tab.link],
      target: this.settingsService.target,
      size: this.searchService.pageSize,
    };
  }

  ngAfterViewInit(): void {
    if (this.tabElem) {
      this.dataService.resultTabList.push(this.tabElem);
    }
  }

  ngOnDestroy(): void {
    this.searchTermSub?.unsubscribe();
  }
}
