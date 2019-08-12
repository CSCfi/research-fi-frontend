//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable  } from '@angular/core';
import { SortService } from './sort.service';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  yearFilter: any;
  fieldFilter: any;
  statusFilter: object;
  today: string;

  private filterSource = new BehaviorSubject({year: [], status: [], field: []});
  filters = this.filterSource.asObservable();

  updateFilters(filters: {year: [], status: [], field: []}) {
    // Create new filters first before sending updated values to components
    this.createFilters(filters);
    this.filterSource.next(filters);
  }

  constructor(private sortService: SortService) { }

  // Filters
  createFilters(filter: any) {
    this.yearFilter = this.filterByYear(filter.year);
    this.statusFilter = this.filterByStatus(filter.status);
    this.fieldFilter = this.filterByFieldOfScience(filter.field);
    }

  filterByYear(filter: any) {
    const res = [];
    const currentTab = this.sortService.currentTab;

    switch (currentTab) {
      case 'fundings': {
        filter.forEach(value => {
          res.push({ term : { fundingStartYear : value } });
        });
        break;
      }
      case 'publications': {
        filter.forEach(value => {
          res.push({ term : { publicationYear : value } });
        });
        break;
      }
    }
    return res;
  }

  filterByFieldOfScience(field: any) {
    const fieldFilters = [];
    field.forEach(value => {
      fieldFilters.push({ term : { 'fields_of_science.nameFiScience.keyword' : value } });
    });
    return fieldFilters;
  }

  // Start & end date filtering
  filterByStatus(range: string) {
    this.today = new Date().toISOString().substr(0, 10).replace('T', ' ');
    let statusFilter;
    switch (JSON.stringify(range)) {
      case '["onGoing"]':
      case '"onGoing"': {
        statusFilter = { range: { fundingEndDate: {gte : '2017-01-01' } } };
        break;
      }
      case '["ended"]':
      case '"ended"': {
        statusFilter = { range: { fundingEndDate: {lte : '2017-01-01' } } };
        break;
      }
      default: {
        statusFilter = undefined;
        break;
      }
    }
    return statusFilter;
  }

  constructQuery(index: string, searchTerm: string) {
    return {
        bool: {
          should: [
            {
              bool: {
                must: [
                  { term: { _index: index } },
                  ...(searchTerm ? [{ query_string : { query : searchTerm } }] : []),
                  ...(index === 'funding' ? (this.statusFilter ? [this.statusFilter] : []) : []),
                  ...(this.yearFilter.length ? { bool: { should: this.yearFilter } } : this.yearFilter),
                  ...(this.fieldFilter.length ? { bool: { should: this.fieldFilter } } : this.fieldFilter)
                ]
              }
            }
          ],
        }
    };
  }

  // Data for results page
  constructPayload(searchTerm: string, fromPage, sortOrder, tab) {
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);
    return {
      query,
      size: 0,
      aggs: {
        _index: {
          filters: {
            filters: {
              persons: {
                match: {
                  _index: 'person'
                }
              },
              publications: {
                match: {
                  _index: 'publication'
                }
              },
              fundings: {
                match: {
                  _index: 'funding'
                }
              }
            }
          },
          aggs: {
            index_results: {
              top_hits: {
                size: 10,
                from: fromPage,
                sort: sortOrder
              }
            },
            years: {
              terms: {
                field: 'publicationYear',
                size: 50,
                order: {
                  _key: 'asc'
                }
              }
            },
            fieldsOfScience: {
              terms: {
                field: 'fields_of_science.nameFiScience.keyword',
                size: 150,
                order : { _key : 'asc' }
              }
            }
          }
        }
      }
    };
  }
}
