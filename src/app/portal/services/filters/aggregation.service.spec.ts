//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { AggregationService } from './aggregation.service';

import { HttpClientTestingModule } from '@angular/common/http/testing';

describe('AggregationService', () => {
  let service: AggregationService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
    });
    service = TestBed.inject(AggregationService);
    service.localeC = 'Fi';
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should return field based on locale', () => {
    const res = service.langByLocale('fi');
    expect(res === 'languageFi').toBeTruthy();
  });

  it('should construct aggregation payload', () => {
    const res = service.constructAggregations([], 'organizations', '');
    expect(Object.keys(res.aggs).length > 0).toBeTruthy();
  });
});
