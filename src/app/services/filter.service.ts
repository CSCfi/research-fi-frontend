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
  currentFilters: any;
  today: string;

  private filterSource = new BehaviorSubject({toYear: [], fromYear: [], year: [], field: [], publicationType: [], countryCode: [], lang: [],
    juFo: [], openAccess: [], internationalCollaboration: [], funder: [], typeOfFunding: [], scheme: [], fundingStatus: [],
    fundingAmount: [], faFieldFilter: [], sector: [], organization: [], type: []});
  filters = this.filterSource.asObservable();
  localeC: string;

  updateFilters(filters: {toYear: any[], fromYear: any[], year: any[], field: any[], publicationType: any[], countryCode: any[],
    lang: any[], openAccess: any[], juFo: any[], internationalCollaboration: any[], funder: any[], typeOfFunding: any[],
    scheme: any[], fundingStatus: any[], fundingAmount: any[], faFieldFilter: any[], sector: any[], organization: any[], type: any[]}) {
    // Create new filters first before sending updated values to components
    this.currentFilters = filters;
    this.createFilters(filters);
    this.filterSource.next(filters);
  }

  constructor(private sortService: SortService, private settingsService: SettingsService,
              @Inject( LOCALE_ID ) protected localeId: string) {
                this.localeC = this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
               }

  // Filters
  createFilters(filter: any) {
    // Global
    this.yearFilter = this.filterByYear(filter.year);
    this.organizationFilter = this.filterByOrganization(filter.organization);
    this.yearRangeFilter = this.rangeFilter(filter.fromYear, filter.toYear);
    // Publication
    this.juFoCodeFilter = this.filterByJuFoCode(filter.juFo);
    this.fieldFilter = this.basicFilter(filter.field, 'fields_of_science.nameFiScience.keyword');
    this.publicationTypeFilter = this.basicFilter(filter.publicationType, 'publicationTypeCode.keyword');
    this.countryCodeFilter = this.filterByCountryCode(filter.countryCode);
    this.langFilter = this.basicFilter(filter.lang, 'languages.languageCode');
    this.openAccessFilter = this.filterByOpenAccess(filter.openAccess);
    this.internationalCollaborationFilter = this.filterByInternationalCollaboration(filter.internationalCollaboration);
    // Funding
    this.funderFilter = this.basicFilter(filter.funder, 'funderName' + this.localeC + '.keyword');
    this.typeOfFundingFilter = this.basicFilter(filter.typeOfFunding, 'typeOfFundingId.keyword');
    this.fundingSchemeFilter = this.basicFilter(filter.scheme, 'keywords.scheme.keyword');
    this.statusFilter = this.filterByStatus(filter.fundingStatus);
    this.fundingAmountFilter = this.filterByFundingAmount(filter.fundingAmount);
    this.faFieldFilter = this.basicFilter(filter.faField, 'keywords.keyword.keyword');
    // Infrastructure
    this.typeFilter = this.basicFilter(filter.type, 'services.serviceType.keyword');
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
      case 'news': {
        filter.forEach(value => { res.push({ term : { 'organizationId.keyword' : value } }); });
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

  // Publciations
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

  addMinMatch(min) {
    return {minimum_should_match: min};
  }

  constructFilters(index) {
    const filters = [
      ...(index === 'publication' ? (this.juFoCodeFilter ? [{ bool: { should: this.juFoCodeFilter } }] : []) : []),
      ...(index === 'publication' ? (this.openAccessFilter ? [{ bool: { should: this.openAccessFilter } }] : []) : []),
      ...(index === 'publication' ? (this.internationalCollaborationFilter ? [this.internationalCollaborationFilter] : []) : []),
      ...(index === 'publication' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
          [{nested: {path: 'author', query: {bool: {should: this.organizationFilter } }}}] : []) : []),
      ...(index === 'funding' ? (this.funderFilter ? [{ bool: { should: this.funderFilter } }] : []) : []),
      // Funding / Organization filter data comes from two different nested aggregations
      ...(index === 'funding' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
          [{bool: {should: [{nested: {path: 'organizationConsortium', query: {bool: {should: this.organizationFilter } }}},
          {nested: {path: 'fundingGroupPerson', query: {bool: {should: this.organizationFilter } }}}]}}] : []) : []),
      ...(index === 'funding' ? (this.typeOfFundingFilter ? [{ bool: { should: this.typeOfFundingFilter } }] : []) : []),
      ...(index === 'funding' ? (this.fundingSchemeFilter ? [{ bool: { should: this.fundingSchemeFilter } }] : []) : []),
      ...(index === 'funding' ? (this.statusFilter ? [this.statusFilter] : []) : []),
      ...(index === 'funding' ? (this.fundingAmountFilter ? [this.fundingAmountFilter] : []) : []),
      ...(index === 'funding' ? (this.faFieldFilter ? [{ bool: { should: this.faFieldFilter } }] : []) : []),
      ...(index === 'infrastructure' ? (this.typeFilter ? [{ bool: { should: this.typeFilter } }] : []) : []),
      ...(index === 'organization' ? (this.sectorFilter ? [{ bool: { should: this.sectorFilter } }] : []) : []),
      ...(index === 'news' ? (this.organizationFilter ? [{ bool: { should: this.organizationFilter } }] : []) : []),
      ...(this.yearFilter ? [{ bool: { should: this.yearFilter } }] : []),
      // ...(index === 'publication' ? (this.yearRangeFilter ? [{ bool: { should: this.yearRangeFilter } }] : []) : []),
      ...(this.fieldFilter ? [{ bool: { should: this.fieldFilter } }] : []),
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

  // Data for results page
  constructPayload(searchTerm: string, fromPage, sortOrder, tab) {
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);
    return {
      query,
      size: 10,
      track_total_hits: true,
      ...(tab === 'publications' && searchTerm ? this.settingsService.completionsSettings(searchTerm) : []),
      from: fromPage,
      sort: sortOrder
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

  constructFilterPayload(tab: string, searchTerm: string) {
    // Filter active filters based on aggregation type. We have simple terms, nested and multiple nested aggregations by data mappings
    const active = this.constructFilters(tab.slice(0, -1)).filter(item => item.bool?.should.length > 0 && !item.bool.should[0].nested);
    const activeNested = this.constructFilters(tab.slice(0, -1)).filter(item => item.nested?.query.bool.should.length > 0);
    const activeMultipleNested = this.constructFilters(tab.slice(0, -1)).filter(item => item.bool?.should.length > 0 &&
                                                                                        item.bool.should[0]?.nested);

    // Functions to filter out active filters. These prevents doc count changes on active filters
    function filterActive(field) {
      return active.filter(item => Object.keys(item.bool.should[0].term).toString() !== field).concat(activeNested, activeMultipleNested);
    }

    function filterActiveNested(path) {
      return activeNested.filter(item => item.nested.path !== path).concat(active, activeMultipleNested);
    }

    function filterActiveMultipleNested(path1, path2) {
      const res = activeMultipleNested.filter(item => item.bool.should[0].nested.path !== path1)
                  .concat(activeMultipleNested.filter(item => item.bool.should[1].nested.path !== path2));
      return res.concat(active, activeNested);
    }

    // Aggregations
    const payLoad: any = {
      ...(searchTerm ? { query: {
        // Get query settings and perform aggregations based on tab. Nested filters use reverse nested aggregation to filter out fields
        // outside path.
        bool: { should: [ this.settingsService.querySettings(tab.slice(0, -1), searchTerm) ] }
        }} : []),
      size: 0,
      aggs: {
        year: {
          filter: {
            bool: {
              filter: filterActive(this.sortService.yearField)
            }
          },
          aggs: {
            years: {
              terms: {
                field: this.sortService.yearField,
                order: { _key : 'desc' }
              }
            }
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
                size: 50,
                field: 'author.nameFiSector.keyword',
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
                    field: 'author.organization.OrganizationNameFi.keyword'
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
                order: { _key : 'asc' }
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
                field: 'languages.languageCode.keyword'
              },
              aggs: {
                language: {
                  terms: {
                    field: 'languages.' + this.langByLocale(this.localeId) + '.keyword'
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
              filter: filterActive('fields_of_science.name' + this.localeC + 'Science.keyword')
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
                    field: 'fields_of_science.fieldIdScience'
                  }
                }
              }
            }
          }
        };
        payLoad.aggs.selfArchived = {
          filter: {
            bool: {
              filter: filterActive('publicationTypeCode.keyword')
            }
          },
          aggs: {
            selfArchivedCodes: {
              terms: {
                field: 'publicationTypeCode.keyword'
              }
            }
          }
        };
        payLoad.aggs.openAccess = {
          filter: {
            bool: {
              filter: filterActive('openAccessCode')
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
        // Doesn't result anything. TODO: Check if this is needed and filter with filterActive function
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
        // Funder
        payLoad.aggs.funder = {
          filter: {
            bool: {
              filter: filterActive('funderName' + this.localeC + '.keyword')
            }
          },
          aggs: {
            funders: {
              terms: {
                field: 'funderName' + this.localeC + '.keyword',
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
            path: 'organizationConsortium'
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field: 'organizationConsortium.consortiumSectorNameFi.keyword',
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
                    field: 'organizationConsortium.consortiumOrganizationNameFi.keyword'
                  },
                  aggs: {
                    filtered: {
                      reverse_nested: {},
                      aggs: {
                        filterCount: {
                          filter: {
                            bool: {
                              filter: filterActiveMultipleNested('organizationConsortium', 'fundingGroupPerson')
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
        };
        // TODO: Check if this is needed
        payLoad.aggs.fundingSector = {
          nested: {
            path: 'fundingGroupPerson'
          },
          aggs: {
            sectorName: {
              terms: {
                size: 50,
                field: 'fundingGroupPerson.fundedPersonSectorNameFi.keyword',
                exclude: ' |Rahoittaja'
              },
              aggs: {
                sectorId: {
                  terms: {
                    size: 50,
                    field: 'fundingGroupPerson.fundedPersonSectorId.keyword'
                  }
                },
                organizations: {
                  terms: {
                    size: 50,
                    field: 'fundingGroupPerson.consortiumOrganizationNameFi.keyword'
                  },
                  aggs: {
                    orgId: {
                      terms: {
                        size: 50,
                        field: 'fundingGroupPerson.consortiumOrganizationId.keyword'
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
                field: 'typeOfFundingId.keyword',
                exclude: ' ',
                size: 250,
                order: {
                  _key: 'asc'
                }
              },
              aggs: {
                typeName: {
                  terms: {
                    field: 'typeOfFundingName' + this.localeC + '.keyword',
                    exclude: ' ',
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
              filter: filterActive('fields_of_science.name' + this.localeC + 'Science.keyword')
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
                    field: 'fields_of_science.fieldIdScience.keyword'
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
              }
            }
          }
        };
        break;
      // Infrastructures
      case 'infrastructures': {
        payLoad.aggs.type = {
          filter: {
            bool: {
              filter: filterActive('services.serviceType.keyword')
            }
          },
          aggs: {
            types: {
              terms: {
                field: 'services.serviceType.keyword'
              }
            }
          }
        };
        break;
      }
      // Organizations
      case 'organizations':
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
                    field: 'sectorNameFi.keyword',
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
            field: 'organizationId.keyword'
          },
          aggs: {
            orgName: {
              terms: {
                field: 'organizationNameFi.keyword'
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
