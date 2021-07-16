//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';
import { FilterService } from './filter.service';
import { SortService } from '../sort.service';
import { SettingsService } from '../settings.service';
import { StaticDataService } from '../static-data.service';
import { AggregationService } from './aggregation.service';
import { LOCALE_ID } from '@angular/core';
import { TabChangeService } from '../tab-change.service';

describe('FilterService', () => {
  let filterService: FilterService;
  let filters: {};
  let tabChangeService: TabChangeService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [
        SortService,
        SettingsService,
        StaticDataService,
        AggregationService,
        TabChangeService,
        { provide: LOCALE_ID, useValue: 'fi' },
      ],
    });

    filterService = TestBed.inject(FilterService);
    tabChangeService = TestBed.inject(TabChangeService);
    filters = {
      coPublication: ['true'],
      countryCode: ['c1'],
      topic: ['Biolääketieteet'],
      field: ['115'],
      fromYear: ['2016'],
      funder: ['2066823-5'],
      fundingAmount: [],
      fundingStatus: [],
      internationalCollaboration: ['true'],
      juFo: ['j2'],
      lang: ['en'],
      openAccess: ['selfArchived'],
      organization: ['01901'],
      publicationType: ['A1'],
      publicationFormat: [],
      publicationAudience: [],
      parentPublicationType: [],
      peerReviewed: [],
      scheme: [],
      sector: ['1'],
      toYear: [],
      type: ['palvelu'],
      typeOfFunding: ['11'],
      year: ['2020'],
    };
  });

  it('should be created', () => {
    expect(filterService).toBeDefined();
  });

  it('#rangeFilter should work as expected', () => {
    // Empty
    expect(filterService.rangeFilter([], [])).toEqual([]);
    // From
    expect(JSON.stringify(filterService.rangeFilter(['f2005'], []))).toContain(
      '"gte":2005'
    );
    // To
    expect(JSON.stringify(filterService.rangeFilter([], ['t2006']))).toContain(
      '"lte":2006'
    );
    // Both
    expect(
      JSON.stringify(filterService.rangeFilter(['f2007'], ['t2012']))
    ).toContain('"gte":2007,"lte":2012');
  });

  it('should construct filters per indice', () => {
    const indexList = [
      'publications',
      'fundings',
      'infrastructures',
      'organizations',
      'news',
    ];
    indexList.forEach((index) => {
      tabChangeService.tab = index;
      filterService.createFilters(filters);
      // Needs to check greater than 1 because of global year filter
      expect(
        filterService.constructFilters(index.slice(0, -1)).length > 1
      ).toBeTruthy();
    });
  });
});
