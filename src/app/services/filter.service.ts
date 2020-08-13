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
import { VisualQueryHierarchy, VisualQuery } from '../models/visualisation/visualisations.model';
import { StaticDataService } from './static-data.service';

@Injectable({
  providedIn: 'root'
})
export class FilterService {
  yearFilter: any;
  yearRangeFilter: any;
  juFoCodeFilter: any;
  fieldFilter: any;
  publicationTypeFilter: any;
  countryCodeFilter: any;
  langFilter: any;
  funderFilter: any;
  typeOfFundingFilter: any;
  fundingSchemeFilter: any;
  statusFilter: object;
  fundingAmountFilter: any;
  openAccessFilter: any;
  internationalCollaborationFilter: any;
  sectorFilter: any;
  faFieldFilter: any;
  organizationFilter: any;
  typeFilter: any;
  infraFieldFilter: any;
  currentFilters: any;
  today: string;

  private filterSource = new BehaviorSubject({toYear: [], fromYear: [], year: [], field: [], publicationType: [], countryCode: [], lang: [],
    juFo: [], openAccess: [], internationalCollaboration: [], funder: [], typeOfFunding: [], scheme: [], fundingStatus: [],
    fundingAmount: [], faFieldFilter: [], sector: [], organization: [], type: []});
  filters = this.filterSource.asObservable();
  localeC: string;
  timestamp: string;
  publication = this.staticDataService.visualisationData.publication;
  funding = this.staticDataService.visualisationData.funding;

  updateFilters(filters: {toYear: any[], fromYear: any[], year: any[], field: any[], publicationType: any[], countryCode: any[],
    lang: any[], openAccess: any[], juFo: any[], internationalCollaboration: any[], funder: any[], typeOfFunding: any[],
    scheme: any[], fundingStatus: any[], fundingAmount: any[], faFieldFilter: any[], sector: any[], organization: any[], type: any[]}) {
    // Create new filters first before sending updated values to components
    this.currentFilters = filters;
    this.createFilters(filters);
    this.filterSource.next(filters);
  }

  constructor(private sortService: SortService, private settingsService: SettingsService,
              @Inject( LOCALE_ID ) protected localeId: string, private staticDataService: StaticDataService) {
                this.localeC = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
               }

  // Elements that are looked from query params.
  filterList(source) {
    return {
      // Global
      year: [source.year].flat().filter(x => x).sort(),
      fromYear: [source.fromYear].flat().filter(x => x).sort(),
      toYear: [source.toYear].flat().filter(x => x).sort(),
      field: [source.field].flat().filter(x => x).sort(),
      organization: [source.organization].flat().filter(x => x).sort(),
      // Publications
      sector: [source.sector].flat().filter(x => x).sort(),
      publicationType: [source.publicationType].flat().filter(x => x).sort(),
      countryCode: [source.countryCode].flat().filter(x => x).sort(),
      lang: [source.lang].flat().filter(x => x).sort(),
      juFo: [source.juFo].flat().filter(x => x).sort(),
      openAccess: [source.openAccess].flat().filter(x => x).sort(),
      internationalCollaboration: [source.internationalCollaboration].flat().filter(x => x).sort(),
      // Fundings
      funder: [source.funder].flat().filter(x => x).sort(),
      typeOfFunding: [source.typeOfFunding].flat().filter(x => x).sort(),
      scheme: [source.scheme].flat().filter(x => x).sort(),
      fundingStatus: [source.fundingStatus].flat().filter(x => x).sort(),
      fundingAmount: [source.fundingAmount].flat().filter(x => x).sort(),
      faField: [source.faField].flat().filter(x => x).sort(),
      // Infrastructures
      type: [source.type].flat().filter(x => x).sort(),
    };
  }

  // Filters
  createFilters(filter: any) {
    // Global
    this.yearFilter = this.filterByYear(filter.year);
    this.organizationFilter = this.filterByOrganization(filter.organization);
    this.yearRangeFilter = this.rangeFilter(filter.fromYear, filter.toYear);
    this.fieldFilter = this.basicFilter(filter.field, 'fields_of_science.fieldIdScience');
    // Publication
    this.juFoCodeFilter = this.filterByJuFoCode(filter.juFo);
    this.publicationTypeFilter = this.basicFilter(filter.publicationType, 'publicationTypeCode.keyword');
    this.countryCodeFilter = this.filterByCountryCode(filter.countryCode);
    this.langFilter = this.basicFilter(filter.lang, 'languages.languageCode');
    this.openAccessFilter = this.filterByOpenAccess(filter.openAccess);
    this.internationalCollaborationFilter = this.filterByInternationalCollaboration(filter.internationalCollaboration);
    // Funding
    this.funderFilter = this.basicFilter(filter.funder, 'funderNameFi.keyword');
    this.typeOfFundingFilter = this.basicFilter(filter.typeOfFunding, 'typeOfFundingId.keyword');
    this.fundingSchemeFilter = this.basicFilter(filter.scheme, 'keywords.scheme.keyword');
    this.faFieldFilter = this.basicFilter(filter.faField, 'keywords.keyword.keyword'); // Finnish Academy field
    // Infrastructure
    this.typeFilter = this.basicFilter(filter.type, 'services.serviceType.keyword');
    this.infraFieldFilter = this.basicFilter(filter.field, 'fieldsOfScience.field_id.keyword');
    // Organization
    this.sectorFilter = this.filterBySector(filter.sector);
  }

  // Year filter is global, different year -fields per index
  filterByYear(filter: any[]) {
    const res = [];
    const currentTab = this.sortService.currentTab;
    switch (currentTab) {
      case 'publications': {
        filter.forEach(value => { res.push({ term : { publicationYear : value } }); });
        break;
      }
      case 'fundings': {
        filter.forEach(value => { res.push({ term : { fundingStartYear : value } }); });
        break;
      }
      case 'infrastructures': {
        filter.forEach(value => { res.push({ term : { startYear : value } }); });
        break;
      }
    }
    return res;
  }

  rangeFilter(from, to) {
    const f = parseInt(from[0]?.slice(1), 10);
    const t = parseInt(to[0]?.slice(1), 10);
    const res = [];
    if (f && t) {
      res.push({ range: {publicationYear: {gte : f, lte: t} } });
    } else if (f) {
      res.push({ range: {publicationYear: {gte : f} } });
    } else {
      res.push({ range: {publicationYear: {lte : t} } });
    }

    return res;
  }

  filterByOrganization(filter: any[]) {
    const res = [];
    const currentTab = this.sortService.currentTab;
    switch (currentTab) {
      case 'publications': {
        filter.forEach(value => { res.push({ term : { 'author.organization.organizationId.keyword' : value } }); });
        break;
      }
      case 'fundings': {
        filter.forEach(value => { res.push({ term : { 'organizationConsortium.consortiumOrganizationId.keyword' : value } }); });
        filter.forEach(value => { res.push({ term : { 'fundingGroupPerson.consortiumOrganizationId.keyword' : value } }); });
        break;
      }
      case 'infrastructures': {
        const filterString = 'responsibleOrganization.TKOppilaitosTunnus.keyword';
        filter.forEach(value => { res.push({ term : { [filterString] : value } }); });
        break;
      }
      case 'news': {
        filter.forEach(value => { res.push({ term : { 'organizationId.keyword' : value } }); });
        break;
      }
    }
    return res;
  }

  // Regular terms filter
  basicFilter(field: any[], path) {
    const res = [];
    field.forEach(value => {
      res.push({ term: {[path] : value}});
    });
    return res;
  }

  // Publications
  filterByCountryCode(code: any[]) {
    const codeFilters = [];
    code.forEach(value => {
      codeFilters.push({ term : { internationalPublication : (value === 'c1' ? true : false) } });
    });
    return codeFilters;
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
          {bool: {must: [{term: {openAccessCode: 0}}, {term: {selfArchivedCode: 0}}]}},
          {bool: {must: [{term: {openAccessCode: 1}}, {term: {selfArchivedCode: 1}}]}},
          {bool: {must: [{term: {openAccessCode: 2}}, {term: {selfArchivedCode: 0}}]}},
          {bool: {must: [{term: {openAccessCode: 2}}, {term: {selfArchivedCode: 1}}]}},
          {bool: {must: [{term: {openAccessCode: 1}}, {term: {selfArchivedCode: 0}}]}},
          {bool: {must: [{term: {openAccessCode: 0}}, {term: {selfArchivedCode: 1}}]}}
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

  addMinMatch(min) {
    return {minimum_should_match: min};
  }

  constructFilters(index) {
    const filters = [
      ...(index === 'publication' ? (this.juFoCodeFilter ? [{ bool: { should: this.juFoCodeFilter } }] : []) : []),
      ...(index === 'publication' ? (this.openAccessFilter ? [{ bool: { should: this.openAccessFilter } }] : []) : []),
      ...(index === 'publication' ? (this.internationalCollaborationFilter ? [{ bool: { should: [this.internationalCollaborationFilter] } }] : []) : []),
      ...(index === 'publication' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
          [{nested: {path: 'author', query: {bool: {should: this.organizationFilter } }}}] : []) : []),
      ...(index === 'funding' ? (this.funderFilter ? [{ bool: { should: this.funderFilter } }] : []) : []),
      // Funding / Organization filter needs to be filtered by fundedPerson code
      // ...(index === 'funding' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
      //     [{nested: {path: 'fundingGroupPerson', query: {bool: {filter: {term: {'fundingGroupPerson.fundedPerson': 1}},
      //     must: {bool: {should: this.organizationFilter}}}}}}] : []) : []),
      // ...(index === 'funding' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
      //     [{nested: {path: 'organizationConsortium', query: {bool: {filter: {term: {'organizationConsortium.isFinnishOrganization': 1}},
      //     must: {bool: {should: this.organizationFilter}}}}}}] : []) : []),

      ...(index === 'funding' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
          [{bool: {should: [{nested: {path: 'organizationConsortium', query: {bool: {filter: {term: {'organizationConsortium.isFinnishOrganization': 1}}, must: { bool: {should: this.organizationFilter } }}}}},
          {nested: {path: 'fundingGroupPerson', query: {bool: {filter: {term: {'fundingGroupPerson.fundedPerson': 1}}, must: { bool: { should: this.organizationFilter } }}}}}]}}] : []) : []),

      ...(index === 'funding' ? (this.typeOfFundingFilter ? [{ bool: { should: this.typeOfFundingFilter } }] : []) : []),
      ...(index === 'funding' ? (this.fundingSchemeFilter ? [{ bool: { should: this.fundingSchemeFilter } }] : []) : []),
      ...(index === 'funding' ? (this.statusFilter ? [this.statusFilter] : []) : []),
      ...(index === 'funding' ? (this.fundingAmountFilter ? [this.fundingAmountFilter] : []) : []),
      ...(index === 'funding' ? (this.faFieldFilter ? [{ bool: { should: this.faFieldFilter } }] : []) : []),
      ...(index === 'infrastructure' ? (this.typeFilter ? [{ bool: { should: this.typeFilter } }] : []) : []),
      ...(index === 'infrastructure' ? (this.organizationFilter ? [{ bool: { should: this.organizationFilter } }] : []) : []),
      // ...(index === 'infrastructure' ? (this.infraFieldFilter ? [{ bool: { should: this.infraFieldFilter } }] : []) : []),

      ...(index === 'infrastructure' ? (this.infraFieldFilter?.length > 0 ? [{nested: {path: 'fieldsOfScience', query: {bool: {should: this.infraFieldFilter } }}}] : []) : []),

      ...(index === 'organization' ? (this.sectorFilter ? [{ bool: { should: this.sectorFilter } }] : []) : []),
      ...(index === 'news' ? (this.organizationFilter ? [{ bool: { should: this.organizationFilter } }] : []) : []),
      ...(this.yearFilter ? [{ bool: { should: this.yearFilter } }] : []),
      // ...(index === 'publication' ? (this.yearRangeFilter ? [{ bool: { should: this.yearRangeFilter } }] : []) : []),
      ...(index === 'publication' || index === 'funding' ? (this.fieldFilter ? [{ bool: { should: this.fieldFilter } }] : []) : []),
      ...(this.publicationTypeFilter ? [{ bool: { should: this.publicationTypeFilter } }] : []),
      ...(this.langFilter ? [{ bool: { should: this.langFilter } }] : []),
      ...(this.countryCodeFilter ? [{ bool: { should: this.countryCodeFilter } }] : []),
    ];
    return filters;
  }

  constructQuery(index: string, searchTerm: string) {
    const query = this.settingsService.querySettings(index, searchTerm);
    return {
        bool: {
          must: [
            { term: { _index: index } },
            ...(searchTerm ? [query] : []),
            ...this.constructFilters(index)
          ],
        }
    };
  }

  generateTimeStamp() {
    this.timestamp = Date.now().toString();
  }

  // Data for results page
  constructPayload(searchTerm: string, fromPage, pageSize, sortOrder, tab) {
    // Generate new timestamp on portal init
    if (searchTerm.length === 0 && !this.timestamp) {this.generateTimeStamp(); }
    // Generate query based on tab and term
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);
    // Use random score when no search term
    const randomQuery = {
      function_score: {
        query,
        random_score: {
          seed: this.timestamp
        }
      }
    };
    // Randomize results if no search term and no sorting activated. Random score doesn't work if sort isn't based with score
    if (searchTerm.length === 0 && (!this.sortService.sortMethod || this.sortService.sortMethod?.length === 0)) {sortOrder.push('_score'); }
    const queryPayload = searchTerm.length > 0 ? query : randomQuery;
    return {
      query: queryPayload,
      size: pageSize || 10,
      track_total_hits: true,
      // TODO: Get completions from all indices
      ...(tab === 'publications' && searchTerm ? this.settingsService.completionsSettings(searchTerm) : []),
      from: fromPage,
      sort: searchTerm.length > 0 ? ['_score', ...sortOrder] : sortOrder
    };
  }

  constructNewsPayload() {
    const query = this.constructQuery('news', undefined);
    return query;
  }

  // Check current ui language
  langByLocale(locale) {
    let field: string;
    switch (locale) {
      case 'fi': {
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

  constructVisualPayload(tab: string, searchTerm: string, categoryIdx: number) {
    // Final query object
    const res: any = {aggs: {}};
    // Order
    const orderAsc = {_key: 'asc'}
    const orderDesc = {_key: 'desc'}
    // Create query with filters and search term
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);
    // Query field hierarchy
    let category: VisualQuery = this.publication[0];
    // Get correct hierarchy based on tab
    switch (tab) {
      case 'publications':
        category = this.publication[categoryIdx];
        break;

      case 'fundings':
        category = this.funding[categoryIdx];
        break;
    
      default:
        break;
    }

    // Get hierarchy object
    const h = category;

    // Support for multiple aggregations in one query (funding organization)
    const levels = 1 + +!!h.hierarchy2;
    for (let loops = 0; loops < levels; loops++) {

      // Reset query object
      const agg: any = {};
      let q = agg;

      const hierarchy = loops ? h.hierarchy2 : h.hierarchy;

      // Populate query with aggregations
      for (let i = 0; i < hierarchy.length; i++) {
        // Get the next field
        const s: VisualQueryHierarchy = hierarchy[i];
        // Name aggregation hierarchy after field names
        q = (i === 0) ? q : (q.aggs[hierarchy[i - 1].name]);
        // Add empty aggs
        q.aggs = {};
        // Nested logic (author -> organization)
        if (s.nested) {
          q.aggs[s.name] = {
            nested: {
              path: s.nested
            }
          }
        } else if (s.filter) {
          q.aggs[s.name] = {
            filter: {
              terms: {
                [s.filter.field]: s.filter.value
              }
            }
          }
        } else {
          // Add terms object
          q.aggs[s.name] = {
            terms: {
              // Translations
              field: s.field?.replace('|locale|', this.localeC),
              script: s.script?.replace('|locale|', this.localeC),
              size: s.size,
              // Include only active filter buckets
              // TODO: Solve include on 2nd level (field of science) with low amount of results
              include: this.currentFilters[s.filterName]?.length ? this.currentFilters[s.filterName] : undefined,
              // Exclude empty strings
              exclude: s.exclude,
              // Add order if needed
              order: s.order ? (s.order - 1 ? orderAsc : orderDesc): undefined
            }
          };
        }
      }
      // Add second level of aggs to query. Differentiate names of aggs
      res.aggs[h.field + (loops ? loops + 1 : '')] = agg.aggs[hierarchy[0].name];
    }

    // Add properties
    res.size = 0;
    res.query = query;

    return res;
  }

  constructFilterPayload(tab: string, searchTerm: string) {
    const filters = this.constructFilters(tab.slice(0, -1));
    // Filter active filters based on aggregation type. We have simple terms, nested and multiple nested aggregations by data mappings
    const active = filters.filter(item => item.bool?.should.length > 0 && !item.bool.should[0].nested && !item.bool.should[0].bool);
    // Actice bool filters come from aggregations that contain multiple terms, eg composite aggregation
    const activeBool = filters.filter(item => item.bool?.should[0]?.bool);
    const activeNested = filters.filter(item => item.nested?.query.bool.should?.length > 0 ||
                                        item.nested?.query.bool.must.bool.should.length > 0);
    const activeMultipleNested = filters.filter(item => item.bool?.should.length > 0 && item.bool.should[0]?.nested);

    // Functions to filter out active filters. These prevents doc count changes on active filters
    function filterActive(field) {
      // Open access aggregations come from 3 different aggs and need special case for filters
      if (field === 'openAccess') {
        const filteredActive = active.filter(item => Object.keys(item.bool.should[0].term)?.toString() !== 'openAccessCode' &&
                                            Object.keys(item.bool.should[0].term)?.toString() !== 'selfArchivedCode');
        return filteredActive.concat(activeNested, activeMultipleNested);
      } else {
        return active.filter(item => Object.keys(item.bool.should[0].term)?.toString() !== field)
        .concat(activeNested, activeMultipleNested, activeBool);
      }
    }

    function filterActiveNested(path) {
      return activeNested.filter(item => item.nested.path !== path).concat(active, activeMultipleNested, activeBool);
    }

    // TODO: Don't rely on path order. Use protype find instead
    function filterActiveMultipleNested(path1, path2) {
      const res = activeMultipleNested.filter(item => item.bool.should[0].nested.path !== path2)
                  .concat(activeMultipleNested.filter(item => item.bool.should[1].nested.path !== path1));
      return res.concat(active, activeNested, activeBool);
    }

    const yearAgg = {
      filter: {
        bool: {
          filter: filterActive(this.sortService.yearField)
        }
      },
      aggs: {
        years: {
          terms: {
            field: this.sortService.yearField,
            order: { _key : 'desc' },
            size: 100
          }
        }
      }
    };

    const basicAgg = (filterMethod, path: string, fieldName: string, orderBy: string, sizeOf: number, l2) => {
      return {
        filter: {
          bool: {
            filter: filterMethod
          }
        },
        aggs: {
          [path]: {
            terms: {
              field: fieldName,
              ...( orderBy ? {order: { _key : orderBy }} : []),
              ...( sizeOf ? {size: sizeOf} : []),
            },
            ...( l2 ? {l2} : [])
          }
        }
      };
    };

    // Aggregations
    const payLoad: any = {
      ...(searchTerm ? { query: {
        // Get query settings and perform aggregations based on tab. Nested filters use reverse nested aggregation to filter out fields
        // outside path.
        bool: { should: [ this.settingsService.querySettings(tab.slice(0, -1), searchTerm) ] }
        }} : []),
      size: 0,
      aggs: {}
    };

    switch (tab) {
      case 'publications':
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.organization = {
          nested: {
            path: 'author'
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field: 'author.name' + this.localeC + 'Sector.keyword',
                exclude: ' '
              },
              aggs: {
                sectorId: {
                  terms: {
                    size: 50,
                    field: 'author.sectorId.keyword'
                  }
                },
                organization: {
                  terms: {
                    size: 50,
                    field: 'author.organization.OrganizationName' + this.localeC + '.keyword'
                  },
                  aggs: {
                    filtered: {
                      reverse_nested: {},
                      aggs: {
                        filterCount: {
                          filter: {
                            bool: {
                              filter: filterActiveNested('author')
                            }
                          }
                        }
                      }
                    },
                    orgId: {
                      terms: {
                        size: 1,
                        field: 'author.organization.organizationId.keyword'
                      }
                    }
                  }
                },
                org: {
                  nested: {
                    path: 'author.organization'
                  },
                  aggs: {
                    org: {
                      terms: {
                        size: 50,
                        field: 'author.organization.OrganizationName' + this.localeC + '.keyword'
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveNested('author')
                                }
                              }
                            }
                          }
                        },
                        orgId: {
                          terms: {
                            size: 10,
                            field: 'author.organization.organizationId.keyword'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.countryCode = {
          filter: {
            bool: {
              filter: filterActive('internationalPublication')
            }
          },
          aggs: {
            countryCodes: {
              terms: {
                field: 'internationalPublication',
                order: { _key : 'asc' },
                size: 50
              }
            }
          }
        };
        payLoad.aggs.lang = {
          filter: {
            bool: {
              filter: filterActive('languages.languageCode')
            }
          },
          aggs: {
            langs: {
              terms: {
                field: 'languages.languageCode.keyword',
                size: 50
              },
              aggs: {
                language: {
                  terms: {
                    field: 'languages.' + this.langByLocale(this.localeId) + '.keyword',
                    size: 100
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.publicationType = {
          filter: {
            bool: {
              filter: filterActive('publicationTypeCode.keyword')
            }
          },
          aggs: {
            publicationTypes: {
              terms: {
                field: 'publicationTypeCode.keyword',
                size: 50,
                exclude: ' ',
                order: {
                  _key: 'asc'
                }
              }
            }
          }
        };
        payLoad.aggs.juFo = {
          filter: {
            bool: {
              filter: filterActive('jufoClassCode.keyword')
            }
          },
          aggs: {
            juFoCodes: {
              terms: {
                field: 'jufoClassCode.keyword',
                order: {
                  _key: 'desc'
                }
              }
            }
          }
        };
        payLoad.aggs.internationalCollaboration = {
          filter: {
            bool: {
              filter: filterActive('internationalCollaboration')
            }
          },
          aggs: {
            internationalCollaborationCodes: {
              terms: {
                field: 'internationalCollaboration',
                size: 2,
              }
            }
          }
        };
        payLoad.aggs.field = {
          filter: {
            bool: {
              filter: filterActive('fields_of_science.fieldIdScience')
            }
          },
          aggs: {
            fields: {
              terms: {
                field: 'fields_of_science.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                fieldId: {
                  terms: {
                    field: 'fields_of_science.fieldIdScience',
                    size: 1
                  },
                }
              }
            }
          }
        };
        payLoad.aggs.selfArchived = {
          filter: {
            bool: {
              filter: filterActive('openAccess')
            }
          },
          aggs: {
            selfArchivedCodes: {
              terms: {
                field: 'selfArchivedCode'
              }
            }
          }
        };
        payLoad.aggs.openAccess = {
          filter: {
            bool: {
              filter: filterActive('openAccess')
            }
          },
          aggs: {
            openAccessCodes: {
              terms: {
                field: 'openAccessCode'
              }
            }
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
          },
          aggs: {
            filtered: {
              filter: {
                bool: {
                  filter: filterActive('openAccess')
                }
              }
            }
          }
        };
        break;
      case 'fundings':
        payLoad.aggs.year = yearAgg;
        // Funder
        payLoad.aggs.funder = {
          filter: {
            bool: {
              filter: filterActive('funderNameFi.keyword')
            }
          },
          aggs: {
            funders: {
              terms: {
                field: 'funderNameFi.keyword',
                size: 250,
                order: {
                  _key: 'asc'
                }
              }
            }
          }
        };
        // Sector & organization
        payLoad.aggs.organization = {
          nested: {
            path: 'fundingGroupPerson'
          },
          aggs: {
            funded: {
              filter: {
                terms: {
                  'fundingGroupPerson.fundedPerson': [
                    1
                  ]
                }
              },
              aggs: {
                sectorName: {
                  terms: {
                    size: 50,
                    field: 'fundingGroupPerson.fundedPersonOrganizationName' + this.localeC + '.keyword',
                    exclude: ' |Rahoittaja'
                  },
                  aggs: {
                    sectorId: {
                      terms: {
                        size: 50,
                        field: 'fundingGroupPerson.consortiumSectorId.keyword'
                      }
                    },
                    organizations: {
                      terms: {
                        size: 50,
                        field: 'fundingGroupPerson.consortiumOrganizationName' + this.localeC + '.keyword'
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveMultipleNested('fundingGroupPerson', 'organizationConsortium')
                                }
                              }
                            }
                          }
                        },
                        orgId: {
                          terms: {
                            size: 1,
                            field: 'fundingGroupPerson.consortiumOrganizationId.keyword'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.organizationConsortium = {
          nested: {
            path: 'organizationConsortium'
          },
          aggs: {
            funded: {
              filter: {
                terms: {
                  'organizationConsortium.isFinnishOrganization': [1]
                }
              },
              aggs: {
                sectorName: {
                  terms: {
                    size: 50,
                    field: 'organizationConsortium.consortiumSectorName' + this.localeC + '.keyword',
                    exclude: ' |Rahoittaja'
                  },
                  aggs: {
                    sectorId: {
                      terms: {
                        size: 50,
                        field: 'organizationConsortium.consortiumSectorId.keyword'
                      }
                    },
                    organizations: {
                      terms: {
                        size: 50,
                        field: 'organizationConsortium.consortiumOrganizationName' + this.localeC + '.keyword'
                      },
                      aggs: {
                        filtered: {
                          reverse_nested: {},
                          aggs: {
                            filterCount: {
                              filter: {
                                bool: {
                                  filter: filterActiveMultipleNested('fundingGroupPerson', 'organizationConsortium')
                                }
                              }
                            }
                          }
                        },
                        orgId: {
                          terms: {
                            size: 1,
                            field: 'organizationConsortium.consortiumOrganizationId.keyword'
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        // Type of funding
        payLoad.aggs.typeOfFunding = {
          filter: {
            bool: {
              filter: filterActive('typeOfFundingId.keyword')
            }
          },
          aggs: {
            types: {
              terms: {
                field: 'typeOfFunding.typeOfFundingHeaderId.keyword',
                exclude: ' '
              },
              aggs: {
                headerFi: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameFi.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc'
                    }
                  },
                  aggs: {
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    }
                  }
                },
                headerEn: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameEn.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc'
                    }
                  },
                  aggs: {
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    }
                  }
                },
                headerSv: {
                  terms: {
                    field: 'typeOfFunding.typeOfFundingHeaderNameSv.keyword',
                    exclude: ' ',
                    size: 250,
                    order: {
                      _key: 'asc'
                    }
                  },
                  aggs: {
                    typeNameSv: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameSv.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameFi: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameFi.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    },
                    typeNameEn: {
                      terms: {
                        field: 'typeOfFunding.typeOfFundingNameEn.keyword',
                        exclude: ' '
                      },
                      aggs: {
                        typeId: {
                          terms: {
                            field: 'typeOfFunding.typeOfFundingId.keyword',
                            exclude: ' '
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        };
        // Field of science
        payLoad.aggs.field = {
          filter: {
            bool: {
              filter: filterActive('fields_of_science.fieldIdScience')
            }
          },
          aggs: {
            fields: {
              terms: {
                field: 'fields_of_science.name' + this.localeC + 'Science.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                fieldId: {
                  terms: {
                    field: 'fields_of_science.fieldIdScience.keyword',
                    size: 1
                  }
                }
              }
            }
          }
        };
        // Funding status
        payLoad.aggs.fundingStatus = {
          filter: {
            bool: {
              filter: filterActive('fundingEndDate')
            }
          },
          aggs: {
            status: {
              range: {
                field: 'fundingEndDate',
                ranges: [
                  {
                    from: this.today
                  }
                ]
              }
            }
          }
        };
        // Scheme & Keywords
        payLoad.aggs.scheme = {
          filter: {
            bool: {
              filter: filterActive('keywords.scheme.keyword')
            }
          },
          aggs: {
            types: {
              terms: {
                field: 'keywords.scheme.keyword',
                size: 10,
              },
              aggs: {
                typeName: {
                  terms: {
                    field: 'keywords.keyword.keyword' + this.localeC + '.keyword',
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.faField = {
          filter: {
            bool: {
              filter: filterActive('keywords.keyword.keyword')
            }
          },
          aggs: {
            faFields: {
              terms: {
                field: 'keywords.keyword.keyword',
                size: 50,
                exclude: ' '
              }
            }
          }
        };
        break;
      // Infrastructures
      case 'infrastructures': {
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.type = basicAgg(filterActive('services.serviceType.keyword'), 'types', 'services.serviceType.keyword', null, null, null);
        payLoad.aggs.organization = {
          filter: {
            bool: {
              filter: filterActive('responsibleOrganization.TKOppilaitosTunnus.keyword')
            }
          },
          aggs: {
            sector: {
              terms: {
                field: 'responsibleOrganization.responsibleOrganizationSector' + this.localeC + '.keyword',
                exclude: ' '
              },
              aggs: {
                organizations: {
                  terms: {
                    field: 'responsibleOrganization.responsibleOrganizationName' + this.localeC + '.keyword',
                    exclude: ' '
                  },
                  aggs: {
                    organizationId: {
                      terms: {
                        field: 'responsibleOrganization.TKOppilaitosTunnus.keyword',
                        exclude: ' '
                      }
                    }
                  }
                },
                sectorId: {
                  terms: {
                    field: 'responsibleOrganization.responsibleOrganizationSectorId.keyword'
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.infraField = {
          nested: {
            path: 'fieldsOfScience'
          },
          aggs: {
            infraFields: {
              terms: {
                field: 'fieldsOfScience.name' + this.localeC + '.keyword'
              },
              aggs: {
                filtered: {
                  reverse_nested: {},
                  aggs: {
                    filterCount: {
                      filter: {
                        bool: {
                          filter: filterActiveNested('fieldsOfScience')
                        }
                      }
                    }
                  }
                },
                majorId: {
                  terms: {
                    field: 'fieldsOfScience.field_id.keyword'
                  }
                }
              }
            }
          }
        };
        break;
      }
      // Organizations
      case 'organizations':
        payLoad.aggs.year = yearAgg;
        payLoad.aggs.sector = {
          filter: {
            bool: {
              filter: filterActive('sectorId.keyword')
            }
          },
          aggs: {
            sectorId: {
              terms: {
                field: 'sectorId.keyword',
                size: 50,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                sectorName: {
                  terms: {
                    field: 'sectorName' + this.localeC + '.keyword',
                  }
                }
              }
            }
          }
        };
        break;
      // News
      case 'news':
        payLoad.aggs.organization = {
          terms: {
            field: 'sectorId.keyword'
          },
          aggs: {
            sectorName: {
              terms: {
                field: 'sectorName' + this.localeC + '.keyword'
              }
            },
            orgName: {
              terms: {
                field: 'organizationName' + this.localeC + '.keyword'
              },
              aggs: {
                orgId: {
                  terms: {
                    field: 'organizationId.keyword'
                  }
                }
              }
            }
          }
        };
        break;
      default:
        break;
    }
    return payLoad;
  }
}
