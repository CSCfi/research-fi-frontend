import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { SortService } from 'src/app/services/sort.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-filter-list',
  templateUrl: './filter-list.component.html',
  styleUrls: ['./filter-list.component.scss']
})
export class FilterListComponent implements OnInit, OnDestroy {
  activeFilters: any;
  fromYear: any;
  toYear: any;
  params: any;
  removeFlag: boolean;

  constructor( @Inject(MAT_DIALOG_DATA) public data: any, private router: Router,
               private sortService: SortService, private dialogRef: MatDialogRef<FilterListComponent> ) { }

  ngOnInit(): void {
    this.activeFilters = this.data.active;
    this.fromYear = this.data.fromYear;
    this.toYear = this.data.toYear;
  }

  removeFilter(filter) {
    // Remove range filters. Check that target active filter matches fromYear filter
    if (filter.length === 5 && filter.slice(0, 1) === 'f') {
      if (this.fromYear && this.toYear) {
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'fromYear');
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'toYear');
        this.activeFilters = this.activeFilters.filter(
          elem => !(this.fromYear <= parseInt(elem.value, 10) && parseInt(elem.value, 10) <= this.toYear));
      } else if (this.fromYear) {
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'fromYear');
        this.activeFilters = this.activeFilters.filter(
          elem => !(this.fromYear <= parseInt(elem.value, 10)));
      } else if (this.toYear) {
        this.activeFilters = this.activeFilters.filter(elem => elem.category !== 'toYear');
        this.activeFilters = this.activeFilters.filter(
          elem => !(this.toYear >= parseInt(elem.value, 10)));
      }
    }

    this.activeFilters = this.activeFilters.filter(elem => elem.value !== filter);
    this.data.active = this.activeFilters.filter(elem => elem.value !== filter);

    this.params = this.activeFilters.reduce((storage, item) => {
      // get the first instance of the category
      const group = item.category;

      // set storage or initialize it
      storage[group] = storage[group] || [];

      // add the current item to storage
      storage[group].push(item.value);

      // return the updated storage to the next iteration
      return storage;
    }, {});  // initially empty object {} as storage

    this.params.sort = this.sortService.sortMethod;

    this.removeFlag = true;
    console.log(this.params);
  }

  execute() {
    if (this.removeFlag) {
      this.router.navigate([], {queryParams: this.params});
    }
    this.dialogRef.close();
  }

  close() {
    this.dialogRef.close();
  }

  ngOnDestroy() {

  }

}
