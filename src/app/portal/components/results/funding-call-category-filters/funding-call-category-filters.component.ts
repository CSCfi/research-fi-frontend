import { Component, OnInit, Output, EventEmitter, Input, SimpleChanges } from '@angular/core';
import { FundingCallFilterService } from '@portal/services/filters/funding-call-filter.service';
import { StaticDataService} from '@portal/services/static-data.service';
import { Search } from '@portal/models/search.model';
import { TabChangeService } from '@portal/services/tab-change.service';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-funding-call-category-filters',
  templateUrl: './funding-call-category-filters.component.html',
  styleUrls: ['./funding-call-category-filters.component.scss']
})
export class FundingCallCategoryFiltersComponent implements OnInit {

  constructor(private fundingCallFilters: FundingCallFilterService, private staticDataSevice: StaticDataService, private tabChangeService: TabChangeService, private route: ActivatedRoute,) { }

  majorFieldsOfScienceAurora = [];
  topLevelFilterSelections = new Set();
  bottomLevelFilterSelections = [];
  filterValuesToEmit = [];
  queryParamSub: any;
  _responseData: any;
  queryParams: any;
  topLevelCategoriesInitialized = false;

  @Input() set responseData(respData: any) {
    // Got all bottom level categories from response
    this._responseData = respData;
    this.bottomLevelFilterSelections = this._responseData?.aggregations?.field?.buckets;
    // For some reason called with empty params when init
    if (this._responseData) {
      if (!this.topLevelCategoriesInitialized){
        this.initTopLevelCategories();
      }
      this.updateViewChipSelections(this.queryParams);
    }
  }

  @Input() resetFundingCallCategoryFilters;

  @Output() filterChangeOutput = new EventEmitter<any>();

  ngOnInit(): void {
    this.queryParamSub = this.route.queryParams.subscribe((params) => {
      this.queryParams = params;
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.resetFundingCallCategoryFilters) {
      this.resetAllFilters();
    }
  }

  clickChip(id: number) {
    this.majorFieldsOfScienceAurora = this.majorFieldsOfScienceAurora.map(u => u.id === id ? { id: u.id, key: u.key, checked: !u.checked } : u);

    this.topLevelFilterSelections.clear();

    this.majorFieldsOfScienceAurora.forEach((item) => {
      item.checked ? this.topLevelFilterSelections.add(item.id.toString()) : null;
    });

    // Add all possible categories to selections
    this.bottomLevelFilterSelections = this._responseData?.aggregations?.field?.buckets;
    this.bottomLevelFilterSelections = this.bottomLevelFilterSelections.filter((item) => {
      return this.topLevelFilterSelections.has(item.parentFieldId.buckets[0].key);
    });
    this.emitBottomLevelFilters();
  }

  private initTopLevelCategories() {
    this._responseData?.aggregations?.mainCategory?.mainCategoryId?.buckets.forEach((itm) => {
      this.majorFieldsOfScienceAurora.push({id: itm.key, key: itm.mainCategoryName.buckets[0].key, checked: false});
    });
    this.majorFieldsOfScienceAurora.sort((a,b) => (a.key > b.key) ? 1 : ((b.key > a.key) ? -1 : 0));
    this.topLevelCategoriesInitialized = true;
  }

  private updateViewChipSelections(params) {
    Array.isArray(params?.field) ? this.bottomLevelFilterSelections = this.bottomLevelFilterSelections.filter((item) => {
      return params.field.some((itm) => {
        return itm === item.key;
      });
    }) : this.bottomLevelFilterSelections = this.bottomLevelFilterSelections.filter((item) => {
      return params?.field === item.key});

    this.resetAllFilters();
    this.bottomLevelFilterSelections.forEach((bottomItem) => {
      const key = bottomItem?.parentFieldId.buckets[0].key.toString();
      if (key) {
        this.topLevelFilterSelections.add(key);
      }
      // This updates visible chips
      this.majorFieldsOfScienceAurora = this.majorFieldsOfScienceAurora.map(u => u.id.toString() === key.toString() ? { id: u.id, key: u.key, checked: true } : u);
    });
  }

  private emitBottomLevelFilters() {
    // Only emit when clicked a button
    this.filterValuesToEmit = [];

    this.bottomLevelFilterSelections.forEach((item) => {
      this.filterValuesToEmit.push(item.key);
    });
    this.filterValuesToEmit.length > 0 ? this.filterChangeOutput.emit({keys: this.filterValuesToEmit}) : this.filterChangeOutput.emit({keys: ''});
  }

  private resetAllFilters() {
    this.topLevelFilterSelections.clear();
    this.majorFieldsOfScienceAurora = this.majorFieldsOfScienceAurora.map(({ id, key }) => ({ id, key, checked: false }));
  }
}
