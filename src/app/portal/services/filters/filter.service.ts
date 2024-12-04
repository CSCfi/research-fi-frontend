//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { Injectable, Inject, LOCALE_ID } from '@angular/core';
import { SortService } from '../sort.service';
import { BehaviorSubject } from 'rxjs';
import { SettingsService } from '../settings.service';
import {
  VisualQueryHierarchy,
  VisualQuery,
} from '../../models/visualisation/visualisations.model';
import { StaticDataService } from '../static-data.service';
import { AggregationService } from './aggregation.service';
import { TabChangeService } from '../tab-change.service';

export type Filters = {
  toYear: string[];
  fromYear: string[];
  year: string[];
  field: string[];
  publicationType: string[];
  publicationFormat: string[];
  publicationAudience: string[];
  parentPublicationType: string[];
  articleType: string[];
  peerReviewed: string[];
  countryCode: string[];
  lang: string[];
  openAccess: string[];
  juFo: string[];
  internationalCollaboration: string[];
  okmDataCollection: string[];
  funder: string[];
  typeOfFunding: string[];
  scheme: string[];
  fundingStatus: string[];
  fundingAmount: string[];
  topic: string[];
  sector: string[];
  organization: string[];
  keyword: string[];
  position: string[];
  dataSource: string[];
  accessType: string[];
  type: string[];
  coPublication: string[];
  date: string[];
  status: string[];
  typeOfFundingId: string[];
  approvalYear: string[];
  decisionMaker: string[];
  callId: string[];
  approvalDate: string[];
};

@Injectable({
  providedIn: 'root',
})
export class FilterService {
  yearFilter: string[];
  juFoCodeFilter: string[];
  fieldFilter: string[];
  publicationTypeFilter: string[];
  publicationFormatFilter: string[];
  publicationAudienceFilter: string[];
  parentPublicationTypeFilter: string[];
  articleTypeFilter: string[];
  peerReviewedFilter: string[];
  countryCodeFilter: string[];
  langFilter: string[];
  funderFilter: string[];
  typeOfFundingFilter: string[];
  fundingSchemeFilter: string[];
  fundingAmountFilter: string[];
  openAccessFilter: string[];
  internationalCollaborationFilter: {
    term: { internationalCollaboration: string | undefined };
  };
  okmDataCollectionFilter: string[];
  coPublicationFilter: string[];
  sectorFilter: string[];
  topicFilter: string[];
  organizationFilter: string[];
  keywordFilter: string[];
  positionFilter: string[];
  dataSourceFilter: string[];
  accessTypeFilter: string[];
  typeFilter: string[];
  infraFieldFilter: string[];
  currentFilters: any;
  dateFilter: string[];
  fundingCallCategoryFilter: string[];
  statusFilter: string[];
  typeOfFundingIdFilter: string[];
  approvalYearFilter: string[];
  decisionMakerFilter: string[];
  callIdFilter: string[];
  approvalDateFilter: string[];

  private filterSource = new BehaviorSubject({
    toYear: [],
    fromYear: [],
    year: [],
    field: [],
    publicationType: [],
    publicationFormat: [],
    publicationAudience: [],
    parentPublicationType: [],
    articleType: [],
    peerReviewed: [],
    countryCode: [],
    lang: [],
    juFo: [],
    openAccess: [],
    internationalCollaboration: [],
    okmDataCollection: [],
    funder: [],
    typeOfFunding: [],
    scheme: [],
    fundingStatus: [],
    fundingAmount: [],
    topic: [],
    sector: [],
    organization: [],
    dataSource: [],
    accessType: [],
    type: [],
    coPublication: [],
    date: [],
    status: [],
    typeOfFundingId: [],
    approvalYear: [],
  });
  filters = this.filterSource.asObservable();
  localeC: string;
  timestamp: string;
  publication = this.staticDataService.visualisationData.publication;
  funding = this.staticDataService.visualisationData.funding;

  updateFilters(filters: Filters) {
    // Create new filters first before sending updated values to components
    this.currentFilters = filters;
    this.createFilters(filters);
    this.filterSource.next(filters);
  }

  constructor(
    private sortService: SortService,
    private settingsService: SettingsService,
    @Inject(LOCALE_ID) protected localeId: string,
    private staticDataService: StaticDataService,
    private aggService: AggregationService,
    private tabChangeService: TabChangeService
  ) {
    this.localeC =
      this.localeId.charAt(0).toUpperCase() + this.localeId.slice(1);
  }

  // Elements that are looked from query params.
  filterList(source) {
    const mapFilter = (filter) =>
      [filter]
        .flat()
        .filter((x) => x)
        .sort();

    return {
      // Global
      year: mapFilter(source.year),
      fromYear: mapFilter(source.fromYear),
      toYear: mapFilter(source.toYear),
      field: mapFilter(source.field),
      organization: mapFilter(source.organization),
      keyword: mapFilter(source.keyword),
      position: mapFilter(source.position),

      // Publications
      sector: mapFilter(source.sector),
      publicationType: mapFilter(source.publicationType),
      publicationFormat: mapFilter(source.publicationFormat),
      publicationAudience: mapFilter(source.publicationAudience),
      parentPublicationType: mapFilter(source.parentPublicationType),
      articleType: mapFilter(source.articleType),
      peerReviewed: mapFilter(source.peerReviewed),
      countryCode: mapFilter(source.countryCode),
      lang: mapFilter(source.lang),
      juFo: mapFilter(source.juFo),
      openAccess: mapFilter(source.openAccess),
      internationalCollaboration: mapFilter(source.internationalCollaboration),
      okmDataCollection: mapFilter(source.okmDataCollection),
      coPublication: mapFilter(source.coPublication),
      // Fundings
      funder: mapFilter(source.funder),
      typeOfFunding: mapFilter(source.typeOfFunding),
      scheme: mapFilter(source.scheme),
      fundingStatus: mapFilter(source.fundingStatus),
      fundingAmount: mapFilter(source.fundingAmount),
      topic: mapFilter(source.topic),

      callId: mapFilter(source.callId),
      approvalDate: mapFilter(source.approvalDate),

      // Datasets
      dataSource: mapFilter(source.dataSource),
      accessType: mapFilter(source.accessType),
      // Infrastructures
      type: mapFilter(source.type),
      // Funding calls
      date: mapFilter(source.date),
      status: mapFilter(source.status),
      typeOfFundingId: mapFilter(source.typeOfFundingId),
      approvalYear: mapFilter(source.approvalYear),
      decisionMaker: mapFilter(source.decisionMaker),
    };
  }

  // Filters
  createFilters(filter: Filters) {
    // Global
    this.yearFilter = this.filterByYear(filter.year);
    this.organizationFilter = this.filterByOrganization(filter.organization);
    this.keywordFilter = this.filterByKeyword(filter.keyword);

    this.positionFilter = this.filterByPosition(filter.position);

    this.fieldFilter = this.basicFilter(
      filter.field,
      'fieldsOfScience.fieldIdScience'
    );
    // Publication
    this.juFoCodeFilter = this.filterByJuFoCode(filter.juFo);
    this.publicationTypeFilter = this.basicFilter(
      filter.publicationType,
      'publicationTypeCode.keyword'
    );
    this.publicationFormatFilter = this.basicFilter(
      filter.publicationFormat,
      'publicationFormat.id.keyword'
    );
    this.publicationAudienceFilter = this.basicFilter(
      filter.publicationAudience,
      'publicationAudience.id.keyword'
    );
    this.parentPublicationTypeFilter = this.basicFilter(
      filter.parentPublicationType,
      'parentPublicationType.id.keyword'
    );
    this.articleTypeFilter = this.basicFilter(
      filter.articleType,
      'articleTypeCode'
    );
    this.peerReviewedFilter = this.basicFilter(
      filter.peerReviewed,
      'peerReviewed.id.keyword'
    );
    this.countryCodeFilter = this.filterByCountryCode(filter.countryCode);
    this.langFilter = this.basicFilter(filter.lang, 'languages.languageCode');
    this.openAccessFilter = this.filterByOpenAccess(filter.openAccess);
    this.internationalCollaborationFilter =
      this.filterByInternationalCollaboration(
        filter.internationalCollaboration
      );
    this.okmDataCollectionFilter = this.filterByOkmDataCollection(
      filter.okmDataCollection
    );
    this.coPublicationFilter = this.customValueFilter(
      filter.coPublication,
      'publicationStatusCode.keyword',
      '9'
    );
    // Funding
    this.funderFilter = this.basicFilter(
      filter.funder,
      'funderBusinessId.pid_content.keyword'
    );
    this.typeOfFundingFilter = this.basicFilter(
      filter.typeOfFunding,
      'typeOfFundingId.keyword'
    );
    this.fundingSchemeFilter = this.basicFilter(
      filter.scheme,
      'keywords.scheme.keyword'
    );
    this.topicFilter = this.basicFilter(
      filter.topic,
      'keywords.keyword.keyword'
    );

    // Datasets
    this.dataSourceFilter = this.basicFilter(
      filter.dataSource,
      'dataCatalog.name' + this.localeC + '.keyword'
    );
    this.accessTypeFilter = this.basicFilter(
      filter.accessType,
      'accessType.keyword'
    );
    this.langFilter = this.basicFilter(filter.lang, 'languages.languageCode');
    // Infrastructure
    this.typeFilter = this.basicFilter(
      filter.type,
      'services.serviceType.keyword'
    );
    this.infraFieldFilter = this.basicFilter(
      filter.field,
      'fieldsOfScience.field_id.keyword'
    );
    // Organization
    this.sectorFilter = this.filterBySector(filter.sector);
    // FundingCalls
    this.dateFilter = this.filterByDateRange(filter.date);
    this.statusFilter = this.filterByStatus(filter.status);
    this.fundingCallCategoryFilter = this.basicFilter(
      filter.field,
      'categories.codeValue.keyword'
    );

    this.typeOfFundingIdFilter = this.basicFilter(
      filter.typeOfFundingId,
      'typeOfFundingGroupId.keyword'
    );

    this.approvalYearFilter = this.basicFilter(
      filter.approvalYear,
      'council.approvalYear'
    );

    this.decisionMakerFilter = this.basicFilter(
      filter.decisionMaker,
      'council.decisionMakerId.keyword'
    );

    this.callIdFilter = this.basicFilter(
      filter.callId,
      'callProgrammeId'
    );

    this.approvalDateFilter = this.basicFilter(
      filter.approvalDate,
      'council.approvalDate'
    );
  }

  // Regular terms filter
  basicFilter(field: any[], path) {
    const res = [];
    field.forEach((value) => {
      res.push({ term: { [path]: value } });
    });
    return res;
  }

  customValueFilter(field: any[], path, value) {
    const res = [];
    field.forEach(() => {
      res.push({ term: { [path]: value } });
    });
    return res;
  }

  // Year filter is global, different year -fields per index
  filterByYear(filter: any[]) {
    const res = [];
    const currentTab = this.tabChangeService.tab;
    switch (currentTab) {
      case 'publications': {
        filter.forEach((value) => {
          res.push({ term: { publicationYear: value } });
        });
        break;
      }
      case 'fundings': {
        filter.forEach((value) => {
          res.push({ term: { fundingStartYear: value } });
        });
        break;
      }
      case 'datasets': {
        filter.forEach((value) => {
          res.push({ term: { datasetCreated: value } });
        });
        break;
      }
      case 'infrastructures': {
        filter.forEach((value) => {
          res.push({ term: { startYear: value } });
        });
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
      res.push({ range: { publicationYear: { gte: f, lte: t } } });
    } else if (f) {
      res.push({ range: { publicationYear: { gte: f } } });
    } else if (t) {
      res.push({ range: { publicationYear: { lte: t } } });
    }

    return res;
  }

  filterByDateRange(dateStrings: string[]) {
    const res = [];
    dateStrings.forEach((dateString) => {
      // Date string format: yyyy-mm-dd|yyyy-mm-dd
      const split = dateString.split('|');
      const from = split[0];
      const to = split[1];

      const f = from ? new Date(from).toLocaleDateString('sv') : undefined; // sv locale uses dashes and correct order
      const t = to ? new Date(to).toLocaleDateString('sv') : undefined;
      if (f) {
        res.push({ range: { callProgrammeOpenDate: { gte: f } } });
      }
      if (t) {
        res.push({ range: { callProgrammeDueDate: { lte: t } } });
      }
    });
    return res;
  }

  filterByStatus(filter: string[]) {
    const now = new Date().toLocaleDateString('sv');
    const noDate = '1900-01-01';
    const res = [];
    filter.forEach((s) => {
      switch (s) {
        case 'open': {
          // Open
          let arr = [];
          arr.push({ range: { callProgrammeDueDate: { gte: now } } });
          res.push(arr);
          arr = [];
          // Continuous
          arr.push({ range: { callProgrammeDueDate: { lte: noDate } } });
          res.push(arr);
          break;
        }
        case 'currentlyOpen': {
          // Open, no future applications
          let arr = [];
          arr.push({ range: { callProgrammeOpenDate: { lte: now } } });
          arr.push({ range: { callProgrammeDueDate: { gte: now } } });
          res.push(arr);
          arr = [];
          // Continuous
          arr.push({ range: { callProgrammeDueDate: { lte: noDate } } });
          res.push(arr);
          break;
        }
        case 'closed': {
          const arr = [];
          arr.push({ range: { callProgrammeDueDate: { gt: noDate } } });
          arr.push({ range: { callProgrammeDueDate: { lt: now } } });
          res.push(arr);
          break;
        }
        case 'future': {
          const arr = [];
          arr.push({ range: { callProgrammeOpenDate: { gt: now } } });
          res.push(arr);
          break;
        }
        // Combined with open calls
        case 'continuous': {
          const arr = [];
          arr.push({ range: { callProgrammeDueDate: { lte: noDate } } });
          res.push(arr);
          break;
        }
      }
    });
    return res;
  }

  filterByOrganization(filter: any[]) {
    const res = [];
    const currentTab = this.tabChangeService.tab;
    switch (currentTab) {
      case 'publications': {
        filter.forEach((value) => {
          res.push({
            term: { 'author.organization.organizationId.keyword': value },
          });
        });
        break;
      }
      case 'persons': {
        filter.forEach((value) => {
          res.push({
            term: {
              'activity.affiliations.sector.organization.organizationId.keyword':
                value,
            },
          });
        });
        break;
      }
      case 'fundings': {
        filter.forEach((value) => {
          res.push({
            term: {
              'organizationConsortium.consortiumOrganizationId.keyword': value,
            },
          });
        });
        filter.forEach((value) => {
          res.push({
            term: {
              'fundingGroupPerson.consortiumOrganizationId.keyword': value,
            },
          });
        });
        break;
      }
      case 'datasets': {
        const filterString = 'actor.sector.organization.organizationId.keyword';
        filter.forEach((value) => {
          res.push({ term: { [filterString]: value } });
        });
        break;
      }
      case 'infrastructures': {
        const filterString =
          'responsibleOrganization.TKOppilaitosTunnus.keyword';
        filter.forEach((value) => {
          res.push({ term: { [filterString]: value } });
        });
        break;
      }
      case 'organizations': {
        filter.forEach((value) => {
          res.push({ term: { 'organizationId.keyword': value } });
        });
        break;
      }
      case 'news': {
        filter.forEach((value) => {
          res.push({ term: { 'organizationId.keyword': value } });
        });
        break;
      }
      case 'funding-calls': {
        const field = 'foundation.businessId.keyword';
        filter.forEach((value) => {
          res.push({ term: { [field]: value } });
        });
        break;
      }
    }
    return res;
  }

  private filterByKeyword(filter: string[]) {
    const res = [];
    const currentTab = this.tabChangeService.tab;
    switch (currentTab) {
      case 'persons': {
        for (const value of filter) {
          res.push(
            {
              term: {
                "personal.keywords.value.keyword": value
              }
            }
          )
        }
      }
    }

    return res;
  }

  private filterByPosition(filter: string[]) {
    const res = [];
    const currentTab = this.tabChangeService.tab;
    switch (currentTab) {
      case 'persons': {
        for (const value of filter) {
          res.push({
            match: {
              'activity.affiliations.positionNameFi.keyword': value
            }
          });
        }
      }
    }

    return res;
  }

  // Publications
  filterByCountryCode(code: any[]) {
    const codeFilters = [];
    code.forEach((value) => {
      codeFilters.push({
        term: {
          internationalPublication:
            value === 'c0' ? 0 : value === 'c1' ? 1 : value === 'c9' ? 9 : '',
        },
      });
    });
    return codeFilters;
  }

  filterByJuFoCode(code: string[]) {
    const res = [];
    if (code.includes('j3')) {
      res.push({ term: { 'jufoClassCode.keyword': 3 } });
    }
    if (code.includes('j2')) {
      res.push({ term: { 'jufoClassCode.keyword': 2 } });
    }
    if (code.includes('j1')) {
      res.push({ term: { 'jufoClassCode.keyword': 1 } });
    }
    if (code.includes('j0')) {
      res.push({ term: { 'jufoClassCode.keyword': 0 } });
    }
    if (code.includes('noVal')) {
      res.push({ term: { 'jufoClassCode.keyword': ' ' } });
    }
    return res;
  }

  filterByOpenAccess(code: string[]) {
    const res = [];
    if (code.includes('openAccess')) {                                          // TODO 52012 vs 52012
      res.push({
        bool: {
          must: [
            { term: { openAccess: 1 } },
            { term: { publisherOpenAccessCode: 1 } },
          ],
        },
      });
    }

    if (code.includes('selfArchived')) {
      res.push({ term: { selfArchivedCode: "1" } });                            // TODO 64399 vs 64400
    }

    if (code.includes('delayedOpenAccess')) {                                   // TODO 188 vs 188
      [0, 1].forEach((val) => {
        res.push({
          bool: {
            must: [
              { term: { openAccess: val } },
              { term: { publisherOpenAccessCode: 3 } },
            ],
          },
        });
      });
    }

    /*if (code.includes('otherOpen')) {                                         // TODO 5890 vs 479
      res.push({
        bool: {
          must: [
            { term: { openAccess: 0 } },
            { term: { publisherOpenAccessCode: 2 } },
          ],
        },
      });
    }*/

    if (code.includes('otherOpen')) {                                           // TODO 5890 vs 5890
      res.push({
        bool: {
          must_not: [
            { term: { selfArchivedCode: '1' } }
          ],
          filter: [
            { term: { openAccess: 1 } },
            { term: { publisherOpenAccessCode: 2 } }
          ]
        }
      });
    }

    /*if (code.includes('nonOpenAccess')) {                                       // TODO 147 361 vs 143 004
      [0, 1, 2, 9].forEach((val) => {
        res.push({
          bool: {
            must: [
              { term: { selfArchivedCode: "0" } },
              { term: { openAccess: 0 } },
              { term: { publisherOpenAccessCode: val } },
            ],
          },
        });
      });
      res.push({
        bool: {
          must: [
            { term: { selfArchivedCode: "0" } },
            { term: { openAccess: 1 } },
            { term: { publisherOpenAccessCode: 0 } },
          ],
        },
      });
    }*/

    if (code.includes('nonOpenAccess')) {                                       // TODO 147361 vs 147361
      res.push({
        bool: {
          must_not: [
            { term: { selfArchivedCode: '1' } }
          ],
          should: [
            {
              bool: {
                filter: [
                  { term: { openAccess: 0 } },
                  {
                    bool: {
                      must_not: [
                        { term: { publisherOpenAccessCode: 3 } }
                      ]
                    }
                  }
                ]
              }
            },
            {
              bool: {
                filter: [
                  { term: { openAccess: 1 } },
                  { term: { publisherOpenAccessCode: 0 } }
                ]
              }
            }
          ],
          minimum_should_match: 1
        }
      });
    }


    if (code.includes('noOpenAccessData')) {                                    // TODO None appears
      const q = { bool: { must_not: [] } };
      const known = [
        [0, 0],
        [0, 1],
        [0, 2],
        [0, 3],
        [0, 9],
        [1, 1],
        [1, 2],
        [1, 3],
      ];

      known.forEach((pair) =>
        q.bool.must_not.push({
          bool: {
            must: [
              { term: { openAccess: pair[0] } },
              { term: { publisherOpenAccessCode: pair[1] } },
            ],
          },
        })
      );
      res.push(q);
    }

    return res;
  }

  filterByInternationalCollaboration(status: any) {
    if (status.length > 0 && JSON.parse(status)) {
      return { term: { internationalCollaboration: "1" } };
    } else {
      return undefined;
    }
  }

  filterByOkmDataCollection(status: any) {
    const res = [];
    if (status.length > 0 && JSON.parse(status)) {
      ['1', '2', '9'].forEach((n) =>
        res.push({ term: { 'publicationStatusCode.keyword': n } })
      );
    }
    return res;
  }

  // Fundings
  filterByFundingAmount(val) {
    let res = {};
    switch (JSON.stringify(val)) {
      case '["over100k"]': {
        res = { range: { amount: { gt: 100000 } } };
        break;
      }
      case '["under100k"]': {
        res = { range: { amount: { lte: 100000 } } };
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
        sector.forEach((value) => {
          res.push({ term: { 'author.sectorId.keyword': value } });
        });
        break;
      }
      case 'organizations': {
        sector.forEach((value) => {
          res.push({ term: { 'sectorId.keyword': value } });
        });
        break;
      }
    }
    return res;
  }

  addMinMatch(min) {
    return { minimum_should_match: min };
  }

  constructFilters(index) {
    const globalFilter = (f) => {
      return f ? [{ bool: { should: f } }] : [];
    };

    const basicFilter = (i, f) => {
      return index === i ? (f ? [{ bool: { should: f } }] : []) : [];
    };

    const nestedFilter = (i, f, p) => {
      return index === i
        ? f?.length > 0
          ? [{ nested: { path: p, query: { bool: { should: f } } } }]
          : []
        : [];
    };

    const rangeFilter = (i, f) => {
      return index === i
        ? f?.length
          ? [{ bool: { should: { bool: { filter: f } } } }]
          : []
        : [];
    };

    const multipleRangeFilter = (i, f) => {
      const shouldArr = f?.map(
        (range) => (range = { bool: { filter: range } })
      );
      return index === i
        ? f?.length
          ? [{ bool: { should: shouldArr } }]
          : []
        : [];
    };

    const coPublicationOrgs = () => {
      if (this.coPublicationFilter[0]) {
        const res = [];
        this.organizationFilter.forEach((item) => {
          res.push({
            bool: {
              should: {
                nested: { path: 'author', query: { bool: { should: item } } },
              },
            },
          });
        });
        return res;
      }
    };

    const filters = [
      // Publications
      // Organization query differs when co-publication filter is selected
      ...(this.coPublicationFilter?.length > 0
        ? coPublicationOrgs()
        : nestedFilter('publication', this.organizationFilter, 'author')),
      ...nestedFilter('publication', this.fieldFilter, 'fieldsOfScience'),
      ...basicFilter('publication', this.publicationTypeFilter),
      ...basicFilter('publication', this.publicationFormatFilter),
      ...basicFilter('publication', this.publicationAudienceFilter),
      ...basicFilter('publication', this.parentPublicationTypeFilter),
      ...basicFilter('publication', this.articleTypeFilter),
      ...basicFilter('publication', this.peerReviewedFilter),
      ...basicFilter('publication', this.countryCodeFilter),
      ...basicFilter('publication', this.langFilter),
      ...basicFilter('publication', this.juFoCodeFilter),
      ...basicFilter('publication', this.openAccessFilter),
      ...basicFilter('publication', this.internationalCollaborationFilter),
      ...basicFilter('publication', this.okmDataCollectionFilter),
      ...basicFilter('publication', this.coPublicationFilter),
      // Persons
      ...basicFilter('person', this.keywordFilter),
      ...nestedFilter('person', this.organizationFilter, 'activity.affiliations.sector.organization'),
      ...nestedFilter('person', this.positionFilter, 'activity.affiliations'),
      // Fundings
      // Funding organization filter differs from nested filter since we need to get filter values from two different parents
      ...(index === 'funding'
        ? this.organizationFilter && this.organizationFilter.length > 0
          ? [
              {
                bool: {
                  should: [
                    {
                      nested: {
                        path: 'organizationConsortium',
                        query: {
                          bool: {
                            filter: {
                              term: {
                                'organizationConsortium.isFinnishOrganization': 1,
                              },
                            },
                            must: { bool: { should: this.organizationFilter } },
                          },
                        },
                      },
                    },
                    {
                      nested: {
                        path: 'fundingGroupPerson',
                        query: {
                          bool: {
                            filter: {
                              term: { 'fundingGroupPerson.fundedPerson': 1 },
                            },
                            must: { bool: { should: this.organizationFilter } },
                          },
                        },
                      },
                    },
                  ],
                },
              },
            ]
          : []
        : []),
      ...basicFilter('funding', this.funderFilter),
      ...basicFilter('funding', this.typeOfFundingFilter),
      ...nestedFilter('funding', this.topicFilter, 'keywords'),
      ...nestedFilter('funding', this.fieldFilter, 'fieldsOfScience'),
      ...basicFilter('funding', this.fundingSchemeFilter),
      ...basicFilter('funding', this.statusFilter),
      ...basicFilter('funding', this.approvalYearFilter),
      ...basicFilter('funding', this.decisionMakerFilter),
      ...basicFilter('funding', this.callIdFilter),
      ...basicFilter('funding', this.approvalDateFilter),

      // Datasets
      ...basicFilter('dataset', this.dataSourceFilter),
      ...basicFilter('dataset', this.accessTypeFilter),
      ...nestedFilter('dataset', this.organizationFilter, 'actor'),
      ...nestedFilter('dataset', this.langFilter, 'languages'),
      ...nestedFilter('dataset', this.fieldFilter, 'fieldsOfScience'),
      // Datasets can have multiple different versions, display latest only
      ...(index === 'dataset'
        ? [
            {
              bool: {
                should: {
                  term: { isLatestVersion: 1 },
                },
              },
            },
          ]
        : []),

      // Infrastructures
      ...basicFilter('infrastructure', this.typeFilter),
      ...basicFilter('infrastructure', this.organizationFilter),
      ...nestedFilter(
        'infrastructure',
        this.infraFieldFilter,
        'fieldsOfScience'
      ),

      // Organizations
      ...basicFilter('organization', this.sectorFilter),
      ...basicFilter('organization', this.organizationFilter),

      // News
      ...basicFilter('news', this.organizationFilter),

      // FundingCalls
      ...basicFilter('funding-call', this.organizationFilter),
      ...nestedFilter('funding-call', this.fundingCallCategoryFilter, 'categories'),
      ...rangeFilter('funding-call', this.dateFilter),
      ...multipleRangeFilter('funding-call', this.statusFilter),
      ...basicFilter('funding-call', this.typeOfFundingIdFilter),

      // Global filters
      ...globalFilter(this.yearFilter),
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
          ...this.constructFilters(index),
        ],
      },
    };
  }

  generateTimeStamp() {
    this.timestamp = Date.now().toString();
  }

  // Data for results page
  constructPayload(searchTerm: string, fromPage, pageSize, sortOrder, tab) {
    // Generate new timestamp on portal init
    if (searchTerm.length === 0 && !this.timestamp) {
      this.generateTimeStamp();
    }

    // Generate query based on tab and term
    const query = this.constructQuery(tab.slice(0, -1), searchTerm);

    // Use random score when no search term
    const randomQuery = {
      function_score: {
        query,
        random_score: {
          seed: this.timestamp,
        },
      },
    };

    // Randomize results if no search term and no sorting activated. Random score doesn't work if sort isn't based with score
    console.log('SEARCH PROPS', searchTerm.length, this.sortService.searchTerm, this.sortService.sortMethod);
    if (
      searchTerm.length === 0 &&
      (!this.sortService.sortMethod ||
        this.sortService.sortMethod?.length === 0)
    ) {
      // If publications are searched without a search term then set sort as publicationYear
      if (tab === 'publications') {
        console.log('publ no term');
        sortOrder.push({publicationYear: {order:'desc'}});
      } else if (tab !== 'persons' && tab !== 'projects') {
        console.log('not pers, not proj');
        sortOrder.push('_score');
      }
    } else {
      // Search term or sort is used
      if (tab === 'publications') {
        console.log('publ has term');
        //sortOrder.push({publicationYear: {order:'desc'}});
      } else if (tab !== 'persons' && tab !== 'projects') {
        console.log('not pers, not proj');
        sortOrder.push('_score');
      }
    }

    const queryPayload = searchTerm.length > 0 ? query : query;

    return {
      query: queryPayload,
      size: pageSize || 10,
      track_total_hits: true,
      // TODO: Get completions from all indices
      ...(tab === 'publications' && searchTerm
        ? this.settingsService.completionsSettings(searchTerm)
        : []),
      from: fromPage,
      sort: searchTerm.length > 0 ? [...sortOrder, '_score'] : sortOrder,
    };
  }

  constructNewsPayload(searchTerm: string) {
    const query = this.constructQuery('news', searchTerm);
    return query;
  }

  // Get open calls
  constructFundingCallPayload() {
    const today = new Date().toLocaleDateString('sv');
    const query = {
      bool: {
        must: [
          { term: { _index: 'funding-call' } },
          {
            bool: {
              filter: [
                { range: { callProgrammeOpenDate: { lte: today } } },
                { range: { callProgrammeDueDate: { gte: today } } },
              ],
            },
          },
        ],
      },
    };
    return query;
  }

  constructVisualPayload(tab: string, searchTerm: string, categoryIdx: number) {
    // Final query object
    const res: any = { aggs: {} };
    // Order
    const orderAsc = { _key: 'asc' };
    const orderDesc = { _key: 'desc' };
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
        q = i === 0 ? q : q.aggs[hierarchy[i - 1].name];
        // Add empty aggs
        q.aggs = {};
        // Nested logic (author -> organization)
        if (s.nested) {
          q.aggs[s.name] = {
            nested: {
              path: s.nested,
            },
          };
        } else if (s.filter) {
          q.aggs[s.name] = {
            filter: {
              terms: {
                [s.filter.field]: s.filter.value,
              },
            },
          };
        } else if (s.sum) {
          q.aggs[s.name] = {
            sum: {
              field: s.sum,
            },
          };
        } else if (s.reverseNested) {
          q.aggs[s.name] = {
            reverse_nested: {},
          };
        } else {
          // Add terms object
          q.aggs[s.name] = {
            terms: {
              // Translations
              field: s.field?.replace('|locale|', this.localeC),
              script: s.script?.replace('|locale|', this.localeC),
              size: s.size,
              // Include only active filter buckets
              include: this.currentFilters[s.filterName]?.length
                ? this.currentFilters[s.filterName]
                : undefined,
              // Exclude empty strings
              exclude: s.exclude,
              // Add order if needed
              order: s.order ? (s.order - 1 ? orderAsc : orderDesc) : undefined,
            },
          };
        }
      }
      // Add second level of aggs to query. Differentiate names of aggs
      res.aggs[h.field + (loops ? loops + 1 : '')] =
        agg.aggs[hierarchy[0].name];
    }

    // Add properties
    res.size = 0;
    res.query = query;

    return res;
  }

  constructFilterPayload(tab: string, searchTerm: string) {
    return this.aggService.constructAggregations(
      this.constructFilters(tab.slice(0, -1)) as any,
      tab,
      searchTerm
    );
  }
}
