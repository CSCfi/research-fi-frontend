//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, LOCALE_ID  } from '@angular/core';
import { SortService } from './sort.service';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from './settings.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  yearFilter: any;
  juFoCodeFilter: any;
  fieldFilter: any;
  publicationTypeFilter: any;
  countryCodeFilter: any;
  langFilter: any;
  statusFilter: object;
  fundingAmountFilter: any;
  openAccessFilter: any;
  internationalCollaborationFilter: any;
  sectorFilter: any;
  organizationFilter: any;
  currentFilters: any;
  today: string;

  private filterSource = new BehaviorSubject({year: [], field: [], publicationType: [], countryCode: [], lang: [],
    juFo: [], openAccess: [], internationalCollaboration: [], fundingStatus: [], fundingAmount: [], sector: [], organization: []});
  filters = this.filterSource.asObservable();

  updateFilters(filters: {year: any[], field: any[], publicationType: any[], countryCode: any[], lang: any[],
    openAccess: any[], juFo: any[], internationalCollaboration: any[], fundingStatus: any[], fundingAmount: any[], sector: any[],
    organization: any[]}) {
    // Create new filters first before sending updated values to components
    this.currentFilters = filters;
    this.createFilters(filters);
    this.filterSource.next(filters);
  }

  constructor(private sortService: SortService, private settingsService: SettingsService,
              @Inject( LOCALE_ID ) protected localeId: string) { }

  // Filters
  createFilters(filter: any) {
    // Publication
    this.yearFilter = this.filterByYear(filter.year);
    this.juFoCodeFilter = this.filterByJuFoCode(filter.juFo);
    this.fieldFilter = this.filterByFieldOfScience(filter.field);
    this.publicationTypeFilter = this.filterByPublicationType(filter.publicationType);
    this.countryCodeFilter = this.filterByCountryCode(filter.countryCode);
    this.langFilter = this.filterByLang(filter.lang);
    this.openAccessFilter = this.filterByOpenAccess(filter.openAccess);
    this.internationalCollaborationFilter = this.filterByInternationalCollaboration(filter.internationalCollaboration);
    // Funding
    this.statusFilter = this.filterByStatus(filter.fundingStatus);
    this.fundingAmountFilter = this.filterByFundingAmount(filter.fundingAmount);
    // Organization
    this.sectorFilter = this.filterBySector(filter.sector);
    this.organizationFilter = this.filterByOrganization(filter.organization);
  }

  filterByYear(filter: any[]) {
    const res = [];
    const currentTab = this.sortService.currentTab;
    switch (currentTab) {
      case 'fundings': {
        filter.forEach(value => { res.push({ term : { fundingStartYear : value } }); });
        break;
      }
      case 'publications': {
        filter.forEach(value => { res.push({ term : { publicationYear : value } }); });
        break;
      }
    }
    return res;
  }

  filterByFieldOfScience(field: any[]) {
    const fieldFilters = [];
    field.forEach(value => {
      fieldFilters.push({ term : { 'fields_of_science.nameFiScience.keyword' : value } });
    });
    return fieldFilters;
  }

  filterByPublicationType(type: any[]) {
    const typeFilters = [];
    type.forEach(value => {
      typeFilters.push({ term : { 'publicationTypeCode.keyword' : value } });
    });
    return typeFilters;
  }

  filterByCountryCode(code: any[]) {
    const codeFilters = [];
    code.forEach(value => {
      codeFilters.push({ term : { internationalPublication : (value === 'c1' ? true : false) } });
    });
    return codeFilters;
  }

  filterByLang(code: any[]) {
    const res = [];
    code.forEach(value => { res.push({ term : { 'languages.languageCode' : value } }); });
    return res;
  }

  filterByJuFoCode(code: string) {
    const res = [];
    if (code.includes('j3')) {res.push({ term : { 'jufoClassCode.keyword' : 3 } }); }
    if (code.includes('j2')) {res.push({ term : { 'jufoClassCode.keyword' : 2 } }); }
    if (code.includes('j1')) {res.push({ term : { 'jufoClassCode.keyword' : 1 } }); }
    if (code.includes('j0')) {res.push({ term : { 'jufoClassCode.keyword' : 0 } }); }
    if (code.includes('noVal')) {res.push({ term : { 'jufoClassCode.keyword' : ' ' } }); }
    return res;
  }

  filterByOpenAccess(code: string) {
    const res = [];
    if (code.includes('openAccess')) {res.push({ term : { openAccessCode: 1} }); }
    if (code.includes('otherOpen')) {res.push({ term : { openAccessCode: 2} }); }
    if (code.includes('selfArchived')) {res.push({ term : { selfArchivedCode: 1} }); }
    if (code.includes('nonOpen')) {
      res.push(
        {bool: {must: [
          { term : { openAccessCode : 0 } },
          { term : { selfArchivedCode : 0 } }
        ]}}
      );
    }
    if (code.includes('noOpenAccessData')) {
      res.push(
        {bool: {must_not: [
          { term : { openAccessCode : 1 } },
          { term : { openAccessCode : 2 } },
          { term : { openAccessCode : 0 } },
          { term : { selfArchivedCode : 1 } },
          { term : { selfArchivedCode : 0 } }
        ]}}
      );
    }
    return res;
  }

  filterByInternationalCollaboration(status: any) {
    if (status.length > 0 && JSON.parse(status)) {
      return { term: { internationalCollaboration: true }	};
    } else { return undefined; }
  }

  // Fundings
  filterByFundingAmount(val) {
    let res = {};
    switch (JSON.stringify(val)) {
      case '["over100k"]': {
        res = { range: { amount: {gt : 100000 } } };
        break;
      }
      case '["under100k"]': {
        res = { range: { amount: {lte : 100000 } } };
        break;
      }
      default: {
        res = undefined;
      }
    }
    return res;
  }

  // Start & end date filtering
  filterByStatus(status: string) {
    this.today = new Date().toISOString().substr(0, 10).replace('T', ' ');
    let statusFilter = {};
    switch (JSON.stringify(status)) {
      case '["onGoing"]': {
        statusFilter = { range: { fundingEndDate: {gte : this.today } } };
        break;
      }
      default: {
        statusFilter = undefined;
        break;
      }
    }
    return statusFilter;
  }

  // Sector
  filterBySector(sector: any[]) {
    const res = [];
    const currentTab = this.sortService.currentTab;
    switch (currentTab) {
      case 'publications': {
        sector.forEach(value => { res.push({ term : { 'author.sectorId.keyword' : value } }); });
        break;
      }
      case 'organizations': {
        sector.forEach(value => { res.push({ term : { 'sectorId.keyword' : value } }); });
        break;
      }
    }
    return res;
  }

  filterByOrganization(organization: any[]) {
    const res = [];
    organization.forEach(value => { res.push({ term : { 'author.organization.organizationId.keyword' : value } }); });
    return res;
  }

  addMinMatch(min) {
    return {minimum_should_match: min};
  }

  constructQuery(index: string, searchTerm: string) {
    const query = this.settingsService.querySettings(index, searchTerm);
    return {
        bool: {
          must: [
            { term: { _index: index } },
            ...(searchTerm ? [query] : []),
            ...(index === 'publication' ? (this.juFoCodeFilter ? [{ bool: { should: this.juFoCodeFilter } }] : []) : []),
            ...(index === 'publication' ? (this.openAccessFilter ? [{ bool: { should: this.openAccessFilter } }] : []) : []),
            ...(index === 'publication' ? (this.internationalCollaborationFilter ? [this.internationalCollaborationFilter] : []) : []),
            ...(index === 'publication' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
                [{nested: {path: 'author', query: {bool: {should: this.organizationFilter } }}}] : []) : []),
            ...(index === 'funding' ? (this.statusFilter ? [this.statusFilter] : []) : []),
            ...(index === 'funding' ? (this.fundingAmountFilter ? [this.fundingAmountFilter] : []) : []),
            ...(index === 'organization' ? (this.sectorFilter ? [{ bool: { should: this.sectorFilter } }] : []) : []),
            ...(this.yearFilter ? [{ bool: { should: this.yearFilter } }] : []),
            ...(this.fieldFilter ? [{ bool: { should: this.fieldFilter } }] : []),
            ...(this.publicationTypeFilter ? [{ bool: { should: this.publicationTypeFilter } }] : []),
            ...(this.langFilter ? [{ bool: { should: this.langFilter } }] : []),
            ...(this.countryCodeFilter ? [{ bool: { should: this.countryCodeFilter } }] : []),
          ],
        }
    };
  }

  // Data for results page
  constructPayload(searchTerm: string, fromPage, sortOrder, tab) {
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);
    return {
      query,
      size: 10,
      ...(tab === 'publications' && searchTerm ? this.settingsService.completionsSettings(searchTerm) : []),
      from: fromPage,
      sort: sortOrder
    };
  }

  // Check current ui language
  langByLocale(locale) {
    let field: string;
    switch (locale) {
      case 'fi-FI': {
        field = 'languageFi';
        break;
      }
      case 'sv': {
        field = 'languageSv';
        break;
      }
      case 'en': {
        field = 'languageEn';
        break;
      }
    }
    return field;
  }

  constructFilterPayload(tab: string, searchTerm: string) {
    const payLoad: any = {
      ...(searchTerm ? { query: {
        bool: { should: [ this.settingsService.querySettings(tab.slice(0, -1), searchTerm) ] }
        }} : []),
      size: 0,
      aggs: {
        year: {
          terms: {
            field: this.sortService.yearField,
            size: 50,
            order: { _key : 'desc' }
          }
        }
      }
    };
    switch (tab) {
      case 'publications':
        payLoad.aggs.organization = {
          nested: {
            path: 'author'
          },
          aggs: {
            sectorName: {
              terms: {
                field: 'author.nameFiSector.keyword',
                exclude: ' '
              },
              aggs: {
                sectorId: {
                  terms: {
                    field: 'author.sectorId.keyword'
                  }
                },
                organizations: {
                  terms: {
                    field: 'author.organization.OrganizationNameFi.keyword'
                  },
                  aggs: {
                    orgId: {
                      terms: {
                        field: 'author.organization.organizationId.keyword'
                      }
                    }
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.countryCode = {
          terms: {
            field: 'internationalPublication',
            order: { _key : 'asc' }
          }
        };
        payLoad.aggs.lang = {
          terms: {
            field: 'languages.languageCode.keyword'
          },
          aggs: {
            language: {
              terms: {
                field: 'languages.' + this.langByLocale(this.localeId) + '.keyword'
              }
            }
          }
        };
        payLoad.aggs.publicationType = {
          terms: {
            field: 'publicationTypeCode.keyword',
            size: 50,
            order: {
              _key: 'asc'
            }
          }
        };
        payLoad.aggs.juFo = {
          terms: {
            field: 'jufoClassCode.keyword',
            order: {
              _key: 'desc'
            }
          }
        };
        payLoad.aggs.internationalCollaboration = {
          terms: {
            field: 'internationalCollaboration',
            size: 2
          }
        };
        payLoad.aggs.field = {
          terms: {
            field: 'fields_of_science.nameFiScience.keyword',
            size: 250,
            order: {
              _key: 'asc'
            }
          },
          aggs: {
            fieldId: {
              terms: {
                field: 'fields_of_science.fieldIdScience'
              }
            },
          }
        };
        payLoad.aggs.selfArchived = {
          terms: {
            field: 'selfArchivedCode'
          }
        };
        payLoad.aggs.openAccess = {
          terms: {
            field: 'openAccessCode'
          }
        };
        // Composite is to get aggregation of selfarchived and open access codes of 0
        payLoad.aggs.oaComposite = {
          composite: {
            sources: [
              {
                selfArchived: {
                  terms: {
                    field: 'selfArchivedCode'
                  }
                }
              },
              {
                openAccess: {
                  terms: {
                    field: 'openAccessCode'
                  }
                }
              }
            ]
          }
        };
        break;
      case 'fundings':
        payLoad.aggs.fundingStatus = {
          range: {
            field: 'fundingEndDate',
            ranges: [
              {
                from: this.today
              }
            ]
          },
        };
        payLoad.aggs.scheme = {
          terms: {
            field: 'keywords.scheme.keyword',
            size: 10
          },
          aggs: {
            field: {
              terms: {
                field: 'keywords.keyword.keyword'
              }
            },
          }
        };
        break;
        case 'organizations':
          payLoad.aggs.sector = {
            terms: {
              field: 'sectorNameFi.keyword',
              size: 50
            },
            aggs: {
              sectorId: {
                terms: {
                  field: 'sectorId.keyword'
                }
              },
            }
          };
          break;

      default:
        break;
    }
    return payLoad;
  }
}
