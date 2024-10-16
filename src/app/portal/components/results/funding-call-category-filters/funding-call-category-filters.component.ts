import {
  Component,
  OnInit,
  Output,
  EventEmitter,
  Input,
  SimpleChanges,
  OnDestroy,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs';
import { NgFor } from '@angular/common';
import { MatChipListbox, MatChipOption } from '@angular/material/chips';

@Component({
    selector: 'app-funding-call-category-filters',
    templateUrl: './funding-call-category-filters.component.html',
    styleUrls: ['./funding-call-category-filters.component.scss'],
    standalone: true,
    imports: [
        MatChipListbox,
        NgFor,
        MatChipOption,
    ],
})
export class FundingCallCategoryFiltersComponent implements OnInit, OnDestroy {
  constructor(private route: ActivatedRoute) {}

  majorFieldsOfScienceAurora = [];
  topLevelFilterSelections = new Set();
  bottomLevelFilterOptions = [];
  filterValuesToEmit = [];
  queryParamSub: Subscription;
  _responseData: any;
  queryParams: any;
  topLevelCategoriesInitialized = false;

  @Input() responseData: any;

  @Input() resetFundingCallCategoryFilters;

  @Output() filterChangeOutput = new EventEmitter<any>();

  ngOnInit(): void {
    this.queryParamSub = this.route.queryParams.subscribe((params) => {
      this.queryParams = params;

      this.bottomLevelFilterOptions =
        this.responseData?.aggregations?.field?.buckets;

      if (!this.topLevelCategoriesInitialized) {
        this.initTopLevelCategories();
      }
      this.updateViewChipSelections(params);
    });
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes.resetFundingCallCategoryFilters) {
      this.resetAllFilters();
    }
  }

  clickChip(id: number) {
    this.majorFieldsOfScienceAurora = this.majorFieldsOfScienceAurora.map((u) =>
      u.id === id ? { id: u.id, key: u.key, checked: !u.checked } : u
    );

    this.topLevelFilterSelections.clear();

    this.majorFieldsOfScienceAurora.forEach((item) => {
      item.checked
        ? this.topLevelFilterSelections.add(item.id.toString())
        : null;
    });

    // Add all possible categories to selections
    this.bottomLevelFilterOptions =
      this.responseData?.aggregations?.field?.buckets;
    this.bottomLevelFilterOptions = this.bottomLevelFilterOptions.filter(
      (item) => {
        return this.topLevelFilterSelections.has(
          item.parentFieldId.buckets[0].key
        );
      }
    );
    this.emitBottomLevelFilters();
  }

  private initTopLevelCategories() {
    this.responseData?.aggregations?.mainCategory?.mainCategoryId?.buckets.forEach(
      (itm) => {
        this.majorFieldsOfScienceAurora.push({
          id: itm.key,
          key: itm.mainCategoryName.buckets[0].key,
          checked: false,
        });
      }
    );
    this.majorFieldsOfScienceAurora.sort((a, b) =>
      a.key > b.key ? 1 : b.key > a.key ? -1 : 0
    );
    this.topLevelCategoriesInitialized = true;
  }

  private updateViewChipSelections(params) {
    if (this.bottomLevelFilterOptions) {
      Array.isArray(params?.field)
        ? (this.bottomLevelFilterOptions =
          this.bottomLevelFilterOptions.filter((item) => {
            return params.field.some((itm) => {
              return itm === item.key;
            });
          }))
        : (this.bottomLevelFilterOptions =
          this.bottomLevelFilterOptions.filter((item) => {
            return params?.field === item.key;
          }));

      this.resetAllFilters();
      this.bottomLevelFilterOptions.forEach((bottomItem) => {
        const key = bottomItem?.parentFieldId.buckets[0].key.toString();
        if (key) {
          this.topLevelFilterSelections.add(key);
        }
        // This updates visible chips
        this.majorFieldsOfScienceAurora = this.majorFieldsOfScienceAurora.map(
          (u) =>
            u.id.toString() === key.toString()
              ? { id: u.id, key: u.key, checked: true }
              : u
        );
      });
    }
  }

  private emitBottomLevelFilters() {
    // Only emit when clicked a button
    this.filterValuesToEmit = [];

    this.bottomLevelFilterOptions.forEach((item) => {
      this.filterValuesToEmit.push(item.key);
    });
    this.filterValuesToEmit.length > 0
      ? this.filterChangeOutput.emit({ keys: this.filterValuesToEmit })
      : this.filterChangeOutput.emit({ keys: '' });
  }

  private resetAllFilters() {
    this.topLevelFilterSelections.clear();
    this.majorFieldsOfScienceAurora = this.majorFieldsOfScienceAurora.map(
      ({ id, key }) => ({ id, key, checked: false })
    );
  }

  ngOnDestroy(): void {
    this.queryParamSub?.unsubscribe();
  }
}
