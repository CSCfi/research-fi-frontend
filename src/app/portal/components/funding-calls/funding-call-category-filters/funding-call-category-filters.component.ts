import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FundingCallFilterService } from '@portal/services/filters/funding-call-filter.service';
import { StaticDataService} from '@portal/services/static-data.service';
import { Search } from '@portal/models/search.model';

@Component({
  selector: 'app-funding-call-category-filters',
  templateUrl: './funding-call-category-filters.component.html',
  styleUrls: ['./funding-call-category-filters.component.scss']
})
export class FundingCallCategoryFiltersComponent implements OnInit {

  constructor(private fundingCallFilters: FundingCallFilterService, private staticDataSevice: StaticDataService) { }

  majorFieldsOfScienceAurora = this.staticDataSevice.majorFieldsOfScienceAurora;
  filterdata: any;
  topLevelFilterKeys = new Set();
  categoryFilterItems = [];
  filterValuesToEmit = [];
  SELECTEDCHIPSINIT = [false,false,false,false,false,false,false,false];
  selectedChips = [...this.SELECTEDCHIPSINIT];

  @Input() responseData: any;

  @Input() resetFundingCallCategoryFilters;

  @Output() filterChangeOutput = new EventEmitter<any>();

  ngOnInit(): void {
    this.majorFieldsOfScienceAurora.sort((a,b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0));
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.resetFundingCallCategoryFilters) {
      this.resetAllFilters();
    }
  }

  clickChip(ind: string, key: string) {
    this.selectedChips[ind] = !this.selectedChips[ind];
    key = key.toString();
    this.topLevelFilterKeys.has(key) ? this.topLevelFilterKeys.delete(key) : this.topLevelFilterKeys.add(key);
    this.constructFilterAreas();
  }

  private constructFilterAreas() {
    this.categoryFilterItems = this.responseData.aggregations?.field?.buckets;
      this.categoryFilterItems = this.categoryFilterItems.filter((item) => {
        return this.topLevelFilterKeys.has(item.parentFieldId.buckets[0].key.toString());
      });
    this.filterValuesToEmit = [];
    this.categoryFilterItems.forEach((item) => {
     this.filterValuesToEmit.push(item.key);
    });
    this.filterValuesToEmit.length > 0 ? this.filterChangeOutput.emit(this.filterValuesToEmit) : this.filterChangeOutput.emit('');
  }

  private resetAllFilters() {
    this.topLevelFilterKeys.clear();
    this.selectedChips = [...this.SELECTEDCHIPSINIT];
  }
}
