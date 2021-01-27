//  This file is part of the research.fi API service
//
//  Copyright 2019 Ministry of Education and Culture, Finland
//
//  :author: CSC - IT Center for Science Ltd., Espoo Finland servicedesk@csc.fi
//  :license: MIT

import { TestBed } from '@angular/core/testing';

import { FilterMethodService } from './filter-method.service';
import AggResponse from '../../../testdata/aggfundingresponse.json';

describe('FilterMethodService', () => {
  let service: FilterMethodService;
  const data = AggResponse.aggregations.field.fields.buckets;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(FilterMethodService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should map minor fields to majors', () => {
    const res = service.separateMinor(data);
    expect(res.length === 6).toBeTruthy();
  });
});
