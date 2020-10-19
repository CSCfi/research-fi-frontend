//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, LOCALE_ID  } from '@angular/core';
import { SortService } from '../sort.service';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../settings.service';
import { VisualQueryHierarchy, VisualQuery } from '../../models/visualisation/visualisations.model';
import { StaticDataService } from '../static-data.service';
import { AggregationService } from './aggregation.service';
import { TabChangeService } from '../tab-change.service';

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
  coPublicationFilter: any;
  sectorFilter: any;
  faFieldFilter: any;
  organizationFilter: any;
  typeFilter: any;
  infraFieldFilter: any;
  currentFilters: any;

  private filterSource = new BehaviorSubject({toYear: [], fromYear: [], year: [], field: [], publicationType: [], countryCode: [], lang: [],
    juFo: [], openAccess: [], internationalCollaboration: [], funder: [], typeOfFunding: [], scheme: [], fundingStatus: [],
    fundingAmount: [], faFieldFilter: [], sector: [], organization: [], type: [], coPublication: []});
  filters = this.filterSource.asObservable();
  localeC: string;
  timestamp: string;
  publication = this.staticDataService.visualisationData.publication;
  funding = this.staticDataService.visualisationData.funding;

  updateFilters(filters: {toYear: any[], fromYear: any[], year: any[], field: any[], publicationType: any[], countryCode: any[],
    lang: any[], openAccess: any[], juFo: any[], internationalCollaboration: any[], funder: any[], typeOfFunding: any[],
    scheme: any[], fundingStatus: any[], fundingAmount: any[], faFieldFilter: any[], sector: any[], organization: any[], type: any[],
    coPublication: any[]}) {
    // Create new filters first before sending updated values to components
    this.currentFilters = filters;
    this.createFilters(filters);
    this.filterSource.next(filters);
  }

  constructor(private sortService: SortService, private settingsService: SettingsService,
              @Inject( LOCALE_ID ) protected localeId: string, private staticDataService: StaticDataService,
              private aggService: AggregationService, private tabChangeService: TabChangeService) {
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
      coPublication: [source.coPublication].flat().filter(x => x).sort(),
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
    this.fieldFilter = this.basicFilter(filter.field, 'fieldsOfScience.fieldIdScience');
    // Publication
    this.juFoCodeFilter = this.filterByJuFoCode(filter.juFo);
    this.publicationTypeFilter = this.basicFilter(filter.publicationType, 'publicationTypeCode.keyword');
    this.countryCodeFilter = this.filterByCountryCode(filter.countryCode);
    this.langFilter = this.basicFilter(filter.lang, 'languages.languageCode');
    this.openAccessFilter = this.filterByOpenAccess(filter.openAccess);
    this.internationalCollaborationFilter = this.filterByInternationalCollaboration(filter.internationalCollaboration);
    this.coPublicationFilter = this.customValueFilter(filter.coPublication, 'publicationStatusCode.keyword', '9');
    // Funding
    this.funderFilter = this.basicFilter(filter.funder, 'funderBusinessId.pid_content.keyword');
    this.typeOfFundingFilter = this.basicFilter(filter.typeOfFunding, 'typeOfFundingId.keyword');
    this.fundingSchemeFilter = this.basicFilter(filter.scheme, 'keywords.scheme.keyword');
    this.faFieldFilter = this.basicFilter(filter.faField, 'keywords.keyword.keyword'); // Finnish Academy field
    // Infrastructure
    this.typeFilter = this.basicFilter(filter.type, 'services.serviceType.keyword');
    this.infraFieldFilter = this.basicFilter(filter.field, 'fieldsOfScience.field_id.keyword');
    // Organization
    this.sectorFilter = this.filterBySector(filter.sector);
  }


  // Regular terms filter
  basicFilter(field: any[], path) {
    const res = [];
    field.forEach(value => {
      res.push({ term: {[path] : value}});
    });
    return res;
  }

  customValueFilter(field: any[], path, value) {
    const res = [];
    field.forEach(item => {
      res.push({ term: {[path] : value}});
    });
    return res;
  }

  // Year filter is global, different year -fields per index
  filterByYear(filter: any[]) {
    const res = [];
    const currentTab = this.tabChangeService.tab;
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
    } else if (t) {
      res.push({ range: {publicationYear: {lte : t} } });
    }

    return res;
  }

  filterByOrganization(filter: any[]) {
    const res = [];
    const currentTab = this.tabChangeService.tab;
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
      case 'organizations': {
        filter.forEach(value => { res.push({ term : { 'organizationId.keyword' : value } }); });
        break;
      }
      case 'news': {
        filter.forEach(value => { res.push({ term : { 'organizationId.keyword' : value } }); });
        break;
      }
    }
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
    const currentTab = this.tabChangeService.tab;
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
    const globalFilter = (f) => {
      return f ? [{ bool: { should: f } }] : [];
    }

    const basicFilter = (i, f) => {
      return index === i ? (f ? [{ bool: { should: f } }] : []) : [];
    };

    const nestedFilter = (i, f, p) => {
      return index === i ? ((f?.length > 0) ? [{nested: {path: p, query: {bool: {should: f } }}}] : []) : [];
    };

    const coPublicationOrgs = () => {
      if (this.coPublicationFilter[0]) {
        const res = [];
        this.organizationFilter.forEach(item => {
          res.push({bool: {should: {nested: {path: 'author', query: {bool: {should: item}}}}}});
        });
        return res;
      }
    };

    const filters = [
      // Publications
      // Organization query differs when co-publication filter is selected
      ...(this.coPublicationFilter?.length > 0 ? coPublicationOrgs() : nestedFilter('publication', this.organizationFilter, 'author')),
      ...(nestedFilter('publication', this.fieldFilter, 'fieldsOfScience')),
      ...(basicFilter('publication', this.publicationTypeFilter)),
      ...(basicFilter('publication', this.countryCodeFilter)),
      ...(basicFilter('publication', this.langFilter)),
      ...(basicFilter('publication', this.juFoCodeFilter)),
      ...(basicFilter('publication', this.openAccessFilter)),
      ...(basicFilter('publication', this.internationalCollaborationFilter)),
      ...(basicFilter('publication', this.coPublicationFilter)),
      // Fundings
      // Funding organization filter differs from nested filter since we need to get filter values from two different parents
      ...(index === 'funding' ? ((this.organizationFilter && this.organizationFilter.length > 0) ?
          [{bool: {should: [{nested: {path: 'organizationConsortium', query: {bool:
            {filter: {term: {'organizationConsortium.isFinnishOrganization': 1}}, must: {bool: {should: this.organizationFilter } }}}}},
          {nested: {path: 'fundingGroupPerson', query: {bool: {filter: {term: {'fundingGroupPerson.fundedPerson': 1}}, must: {bool:
            {should: this.organizationFilter } }}}}}]}}] : []) : []),
      ...(basicFilter('funding', this.funderFilter)),
      ...(basicFilter('funding', this.typeOfFundingFilter)),
      ...(basicFilter('funding', this.faFieldFilter)),
      ...(nestedFilter('funding', this.fieldFilter, 'fieldsOfScience')),
      ...(basicFilter('funding', this.fundingSchemeFilter)),
      ...(basicFilter('funding', this.statusFilter)),

      // Infrastructures
      ...(basicFilter('infrastructure', this.typeFilter)),
      ...(basicFilter('infrastructure', this.organizationFilter)),
      ...(nestedFilter('infrastructure', this.infraFieldFilter, 'fieldsOfScience')),

      // Organizations
      ...(basicFilter('organization', this.sectorFilter)),
      ...(basicFilter('organization', this.organizationFilter)),

      // News
      ...(basicFilter('news', this.organizationFilter)),

      // Global filters
      ...(globalFilter(this.yearFilter)),

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
      sort: searchTerm.length > 0 ? [...sortOrder, '_score'] : sortOrder
    };
  }

  constructNewsPayload(searchTerm: string) {
    const query = this.constructQuery('news', searchTerm);
    return query;
  }

  constructVisualPayload(tab: string, searchTerm: string, categoryIdx: number) {
    // Final query object
    const res: any = {aggs: {}};
    // Order
    const orderAsc = {_key: 'asc'};
    const orderDesc = {_key: 'desc'};
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
    return this.aggService.constructAggregations(this.constructFilters(tab.slice(0, -1)) as any, tab, searchTerm);
  }
}
