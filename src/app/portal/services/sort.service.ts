//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { AppSettingsService } from '@shared/services/app-settings.service';

@Injectable({
  providedIn: 'root',
})
export class SortService {
  sortMethod: string;
  currentTab: string;
  sort: any[];
  yearField: string;
  sortColumn: string;
  sortDirection: boolean;
  searchTerm = '';
  localeC: string;

  constructor(
    @Inject(LOCALE_ID) protected localeId: string,
    private appSettingsService: AppSettingsService
  ) {
    this.localeC = this.appSettingsService.capitalizedLocale;
  }

  // If term is available, default sort changes
  getTerm(term) {
    this.searchTerm = term;
  }

  // Get sort method
  updateSort(sortBy: string) {
    this.sortMethod = sortBy;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  updateTab(tab: string) {
    this.currentTab = tab;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  updateSortAndTab(sort: string, tab: string) {
    this.sortMethod = sort;
    this.currentTab = tab;
    this.updateSortParam(this.sortMethod, this.currentTab);
  }

  sortBy(sortBy: string, activeSort: string) {
    this.sortColumn = sortBy;
    this.sortDirection = sortBy === activeSort;
    return [this.sortColumn, this.sortDirection];
  }

  initSort(sort: string) {
    this.sortDirection = sort.slice(-4) === 'Desc';
    this.sortColumn = this.sortDirection ? sort.slice(0, -4) : sort;
  }

  generateNested(parent: string, filterQuery?: { [key: string]: unknown }) {
    return {
      path: parent,
      filter: filterQuery
        ? filterQuery
        : {
            match_all: {},
          },
    };
  }

  generateTermFilter(path, value) {
    return {
      bool: {
        must: {
          term: {
            [path]: value,
          },
        },
      },
    };
  }

  private updateSortParam(sort: string, tab: string) {
    this.currentTab = tab;
    this.sortMethod = sort;
    this.initSort(sort || '');
    switch (this.currentTab) {
      case 'publications': {
        this.yearField = 'publicationYear';
        switch (this.sortColumn) {
          case 'name': {
            this.sort = [
              {
                'publicationName.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'author': {
            this.sort = [
              {
                'authorsText.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'medium': {
            this.sort = [
              {
                'journalName.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'year': {
            this.sort = [
              {
                publicationYear: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          default: {
            this.sort = [];
            break;
          }
        }
        break;
      }
      case 'persons': {
        this.sort = [
          {
            'personal.names.lastName.keyword': {
              order: this.sortDirection ? 'desc' : 'asc',
              unmapped_type: 'long',
            },
          },
        ];
        break;
      }
      case 'fundings': {
        this.yearField = 'fundingStartYear';
        switch (this.sortColumn) {
          case 'name': {
            this.sort = [
              {
                'projectNameFi.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'funder': {
            const sortString = 'funderNameFi.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'funded': {
            const personSortString =
              'fundingGroupPerson.consortiumOrganizationName' +
              this.localeC +
              '.keyword';
            const organizationSortString =
              'organizationConsortium.consortiumOrganizationName' +
              this.localeC +
              '.keyword';
            // Nested fields have to be sorted via path and filter
            this.sort = [
              {
                [personSortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                  nested: this.generateNested('fundingGroupPerson'),
                },
              },
              {
                'fundingGroupPerson.fundingGroupPersonLastName.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                  nested: this.generateNested(
                    'fundingGroupPerson',
                    this.generateTermFilter(
                      'fundingGroupPerson.fundedPerson',
                      1
                    )
                  ),
                },
              },
              {
                'fundingGroupPerson.fundingGroupPersonFirstNames.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                  nested: this.generateNested(
                    'fundingGroupPerson',
                    this.generateTermFilter(
                      'fundingGroupPerson.fundedPerson',
                      1
                    )
                  ),
                },
              },
              {
                [organizationSortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                  nested: this.generateNested('organizationConsortium'),
                },
              },
            ];
            break;
          }
          case 'year': {
            this.sort = [
              {
                fundingStartYear: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          default: {
            this.sort = [
              {
                fundingStartYear: {
                  order: this.sortDirection ? 'desc' : 'desc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
        }
        break;
      }
      case 'datasets': {
        this.yearField = 'datasetCreated';
        switch (this.sortColumn) {
          case 'name': {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'author': {
            const sortString = 'creatorsText.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'year': {
            const sortString = this.yearField;
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          default: {
            const sortString = this.yearField;
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'asc' : 'desc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
        }
        break;
      }
      case 'infrastructures': {
        this.yearField = 'startYear';
        switch (this.sortColumn) {
          case 'acronym': {
            this.sort = [
              {
                'acronym.keyword': {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'name': {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'organization': {
            const sortString =
              'responsibleOrganization.responsibleOrganizationName' +
              this.localeC +
              '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          // case 'sector': {
          //   this.sort = [{'responsibleOrganizationNameFi.keyword': {order: this.sortDirection ? 'desc' : 'asc', unmapped_type : 'long'}}];
          //   break;
          // }
          default: {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'asc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
        }
        break;
      }
      case 'organizations': {
        this.yearField = 'thesisYear.keyword';
        switch (this.sortColumn) {
          case 'name': {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'sector': {
            const sortString = 'sectorName' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          default: {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
        }
        break;
      }
      case 'projects': {
        this.yearField = 'startYear';
        switch (this.sortColumn) {
          case 'name': {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'abbreviation': {
            const sortString = 'abbreviation.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'year': {
            this.sort = [
              {
                startYear: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          default: {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
        }
        break;
      }

      case 'fundingCalls': {
        const sortByFunderName = {
          [`foundation.name${this.localeC}.keyword`]: {
            order: 'asc',
            unmapped_type: 'long',
          },
        }; // Sorts calls when shared due date

        switch (this.sortColumn) {
          case 'name': {
            const sortString = 'name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'funder': {
            const sortString = 'foundation.name' + this.localeC + '.keyword';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
              },
            ];
            break;
          }
          case 'callOpen': {
            const sortString = 'callProgrammeOpenDate';
            const sortStringSecondary = 'callProgrammeDueDate';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
                [sortStringSecondary]: {
                  order: 'asc',
                  unmapped_type: 'long',
                },
                ...sortByFunderName,
              },
            ];
            break;
          }
          case 'callDue': {
            const sortString = 'callProgrammeDueDate';
            const sortStringSecondary = 'callProgrammeOpenDate';
            this.sort = [
              {
                [sortString]: {
                  order: this.sortDirection ? 'desc' : 'asc',
                  unmapped_type: 'long',
                },
                [sortStringSecondary]: {
                  order: 'asc',
                  unmapped_type: 'long',
                },
                ...sortByFunderName,
              },
            ];
            break;
          }
          default: {
            const sortString = 'callProgrammeDueDate';
            const sortStringSecondary = 'callProgrammeOpenDate';

            this.sort = [
              {
                [sortString]: { order: 'asc', unmapped_type: 'long' },
                [sortStringSecondary]: { order: 'asc', unmapped_type: 'long' },
                ...sortByFunderName,
              },
            ];
            break;
          }
        }
        break;
      }
      default: {
        this.sort = ['defaultSort'];
      }
    }
    return this.sort;
  }
}
